"""Read fixed private organic acquisition aggregates; never save full reports or credentials."""
import argparse
import json
import pathlib
import re
import sys
import time
import urllib.error
import urllib.request

PERIODS = ('current7', 'previous7', 'current28', 'previous28')
DEFINITION = {'metric': 'newUsers', 'channelDimension': 'firstUserDefaultChannelGroup',
              'channel': 'Organic Search', 'attribution': 'first_user', 'testExclusionDimension': 'firstUserSource'}


def safe_source(value):
    value = str(value).split('?', 1)[0].split('#', 1)[0]
    value = re.sub(r'[^\s/]+@[^\s/]+', '[redacted-email]', value)
    if re.search(r'GOCSPX-|ya29\.|refresh_token|client_secret|access_token', value, re.I):
        return '[redacted]'
    return value[:160]


def count(value):
    if isinstance(value, bool):
        return None
    if isinstance(value, int) and 0 <= value <= 9007199254740991:
        return value
    if isinstance(value, str) and re.fullmatch(r'\d+', value) and int(value) <= 9007199254740991:
        return int(value)
    return None


def summarize(report):
    data = report.get('acquisition', {})
    if data.get('definition') != DEFINITION or data.get('timeZone') != 'America/Los_Angeles':
        raise ValueError('Unexpected acquisition definition or timezone')
    totals = {}
    for name in PERIODS:
        item = data.get('totals', {}).get(name, {})
        value = count(item.get('newUsers')) if item.get('state') == 'reported' else None
        totals[name] = {'newUsers': value, 'state': item.get('state', 'unavailable'), 'limited': bool(item.get('limited'))}
    periods = {name: {key: data.get('periods', {}).get(name, {}).get(key)
                      for key in ('startDate', 'endDate')} for name in PERIODS}
    sections = {}
    for name, dimension, maximum in [('daily28', 'date', 28), ('sources28', 'firstUserSourceMedium', 30)]:
        item = data.get('reports', {}).get(name, {})
        dims = [h.get('name') for h in item.get('dimensionHeaders', [])]
        metrics = [h.get('name') for h in item.get('metricHeaders', [])]
        rows = []
        if dimension in dims and 'newUsers' in metrics:
            for row in item.get('rows', [])[:maximum]:
                dimension_values, metric_values = row.get('dimensionValues', []), row.get('metricValues', [])
                if len(dimension_values) <= dims.index(dimension) or len(metric_values) <= metrics.index('newUsers'):
                    continue
                value = dimension_values[dims.index(dimension)].get('value', '')
                if dimension == 'date' and not re.fullmatch(r'\d{8}', value):
                    continue
                rows.append({dimension: safe_source(value), 'newUsers': count(metric_values[metrics.index('newUsers')].get('value'))})
        metadata = item.get('metadata', {})
        sections[name] = {'returnedRows': len(item.get('rows', [])), 'availableRows': item.get('rowCount'),
                          'savedRows': len(rows), 'rows': rows,
                          'metadata': {key: metadata[key] for key in ('timeZone', 'subjectToThresholding', 'dataLossFromOtherRow', 'samplingMetadatas') if key in metadata}}
    return {'generatedAt': report.get('generatedAt'), 'status': data.get('status', 'unavailable'),
            'definition': DEFINITION, 'timeZone': data['timeZone'], 'periods': periods, 'totals': totals,
            'unavailable': [x for x in data.get('unavailable', []) if x in (*PERIODS, 'daily28', 'sources28')],
            'limited': [x for x in data.get('limited', []) if x in (*PERIODS, 'daily28', 'sources28')],
            'apiStatuses': [x.get('httpStatus') for x in report.get('evidence', [])], 'sections': sections,
            'limits': ['First-user organic acquisition, not session attribution or event counts.',
                       'No report rows or unavailable totals remain null, not zero.',
                       'Period totals come directly from Google; never sum source or daily rows as their replacement.',
                       'Source rows are bounded samples; calendar-complete days may still be revised.',
                       'Different release batches, thresholds and low sample sizes prevent causal growth claims.']}


def self_test():
    fixture = {'acquisition': {'definition': DEFINITION, 'timeZone': 'America/Los_Angeles', 'status': 'partial',
        'totals': {'current7': {'newUsers': 0, 'state': 'reported'}, 'previous7': {'state': 'no_rows'},
                   'current28': {'newUsers': 2, 'state': 'reported'}, 'previous28': {'newUsers': 0, 'state': 'unavailable'}},
        'reports': {'sources28': {'dimensionHeaders': [{'name': 'firstUserSourceMedium'}],
            'metricHeaders': [{'name': 'newUsers'}], 'rows': [
                {'dimensionValues': [{'value': 'private@example.invalid / organic'}], 'metricValues': [{'value': '2'}]},
                {'dimensionValues': [{'value': 'bing / organic'}], 'metricValues': [{'value': '2'}]}]}},
        'unavailable': ['previous28'], 'private_sdk_error': 'fixture-private-value'}}
    value = summarize(fixture)
    assert value['totals']['current7']['newUsers'] == 0
    assert value['totals']['previous7']['newUsers'] is None
    assert value['totals']['previous28']['newUsers'] is None
    assert value['totals']['current28']['newUsers'] == 2
    assert 'private@example.invalid' not in json.dumps(value) and 'fixture-private-value' not in json.dumps(value)
    assert count(True) is None and count('NaN') is None
    print(json.dumps({'fixtureTestsPassed': 6, 'realGoogleQueried': False}))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--config', default='.private/vercel-env.json')
    parser.add_argument('--output', default='reports/organic-acquisition-latest.json')
    parser.add_argument('--self-test', action='store_true')
    args = parser.parse_args()
    if args.self_test:
        self_test()
        return
    try:
        secret = json.loads(pathlib.Path(args.config).read_text(encoding='utf-8-sig'))['SEO_JOB_SECRET']
        request = urllib.request.Request('https://guruholdings.net/api/seo/daily?view=acquisition', data=b'',
                                         headers={'Authorization': 'Bearer ' + secret})
        started = time.monotonic()
        with urllib.request.urlopen(request, timeout=150) as response:
            summary = summarize(json.load(response))
            summary.update(httpStatus=response.status, elapsedMs=round((time.monotonic()-started)*1000), cacheControl=response.headers.get('cache-control'))
        output = pathlib.Path(args.output)
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding='utf-8')
        print(json.dumps({key: value for key, value in summary.items() if key not in ('sections', 'limits')}, ensure_ascii=True))
        if summary['status'] not in ('available', 'partial'):
            raise SystemExit(1)
    except urllib.error.HTTPError as error:
        print(json.dumps({'httpStatus': error.code, 'available': False}))
        raise SystemExit(1)
    except (OSError, ValueError, KeyError, TypeError):
        print(json.dumps({'available': False, 'error': 'Acquisition collection unavailable; no metrics inferred or credentials printed.'}))
        raise SystemExit(1)


if __name__ == '__main__':
    main()
