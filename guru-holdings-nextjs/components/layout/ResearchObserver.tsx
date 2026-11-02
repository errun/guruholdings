'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { researchContext, trackResearch } from '@/lib/research-analytics';

export function ResearchObserver() {
  const pathname = usePathname();
  useEffect(() => {
    const root = document.querySelector('main');
    if (!root) return;
    const seen = new Set<string>();
    const visible = new Map<Element, boolean>();
    const selector = '[data-analytics-section], [data-analytics-signal]';
    const recordView = (element: HTMLElement) => {
      const signal = element.dataset.analyticsSignal;
      const section = element.dataset.analyticsSection;
      const key = signal ? `signal:${signal}:${element.dataset.analyticsEntity}:${element.dataset.analyticsManager || ''}` : `section:${section}`;
      if (!seen.has(key) && trackResearch(signal ? 'signal_view' : 'research_section_view',
        signal ? { signal_type: signal, entity_id: element.dataset.analyticsEntity, manager_id: element.dataset.analyticsManager } : { section })) seen.add(key);
    };
    const flush = () => {
      if (document.visibilityState !== 'hidden') visible.forEach((isVisible, element) => {
        if (isVisible && element.isConnected) recordView(element as HTMLElement);
      });
    };
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver((entries) => {
      entries.forEach((entry) => visible.set(entry.target, entry.isIntersecting && entry.intersectionRect.height >= Math.min(200, entry.boundingClientRect.height * 0.25)));
      flush();
    }, { threshold: [0, 0.01, 0.05, 0.1, 0.25] });
    const scan = (node: Element) => {
      const add = (element: Element) => {
        if (!visible.has(element)) { visible.set(element, false); observer?.observe(element); }
      };
      if (node.matches(selector)) add(node);
      node.querySelectorAll(selector).forEach(add);
    };
    scan(root);
    const mutation = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach((node) => { if (node instanceof Element) scan(node); }));
      records.forEach((record) => {
        if (record.type === 'attributes' && record.target instanceof HTMLElement && visible.get(record.target)) recordView(record.target);
      });
      visible.forEach((_value, element) => {
        if (!element.isConnected) { visible.delete(element); observer?.unobserve(element); }
      });
    });
    mutation.observe(root, { childList: true, subtree: true, attributes: true,
      attributeFilter: ['data-analytics-signal', 'data-analytics-entity', 'data-analytics-manager', 'data-analytics-section'] });
    const click = (event: MouseEvent) => {
      if (!event.isTrusted || event.button > 1 || !(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>('a[href]');
      if (!link || !root.contains(link)) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      const target = researchContext(url.pathname);
      if (!['stock', 'manager'].includes(target.page_type) || !target.page_entity) return;
      const section = link.closest<HTMLElement>('[data-analytics-section]')?.dataset.analyticsSection;
      const params = { target_type: target.page_type, target_id: target.page_entity, section: section || 'content' };
      trackResearch('research_navigation', params);
      if (section === 'search') trackResearch('search_result_select', { ...params, result_type: link.dataset.analyticsResult || target.page_type });
      if (section === 'comparison') trackResearch('compare_result_select', params);
      const signal = link.closest<HTMLElement>('[data-analytics-signal]');
      if (signal) trackResearch('signal_select', { ...params, signal_type: signal.dataset.analyticsSignal,
        entity_id: signal.dataset.analyticsEntity, manager_id: signal.dataset.analyticsManager });
    };
    const toggle = (event: Event) => {
      const details = event.target;
      if (event.isTrusted && details instanceof HTMLDetailsElement && details.open && details.dataset.analyticsHistory) {
        trackResearch('history_details_open', { section: details.dataset.analyticsHistory });
      }
    };
    const chart = (event: Event) => {
      if (!event.isTrusted || !(event.target instanceof Element)) return;
      if (event instanceof KeyboardEvent && !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Enter', ' '].includes(event.key)) return;
      const element = event.target.closest<HTMLElement>('[data-analytics-chart]');
      if (!event.target.closest('.recharts-wrapper')) return;
      const key = `chart:${element?.dataset.analyticsChart}`;
      if (element && !seen.has(key) && trackResearch('chart_interact', {
        section: element.dataset.analyticsChart, interaction: event.type === 'keydown' ? 'keyboard' : 'pointer',
      })) seen.add(key);
    };
    const restored = (event: PageTransitionEvent) => { if (event.persisted) { seen.clear(); flush(); } };
    root.addEventListener('click', click); root.addEventListener('auxclick', click);
    root.addEventListener('toggle', toggle, true); root.addEventListener('pointerdown', chart, { passive: true });
    root.addEventListener('keydown', chart); window.addEventListener('pageshow', restored);
    window.addEventListener('guru:analytics-ready', flush); document.addEventListener('visibilitychange', flush);
    return () => {
      observer?.disconnect(); mutation.disconnect();
      root.removeEventListener('click', click); root.removeEventListener('auxclick', click);
      root.removeEventListener('toggle', toggle, true); root.removeEventListener('pointerdown', chart);
      root.removeEventListener('keydown', chart); window.removeEventListener('pageshow', restored);
      window.removeEventListener('guru:analytics-ready', flush); document.removeEventListener('visibilitychange', flush);
    };
  }, [pathname]);
  return null;
}
