# 部署说明

## GitHub Pages 部署步骤

### 1. 推送代码到GitHub

```bash
# 初始化Git仓库
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "Initial commit: 大师持仓追踪网站"

# 添加远程仓库（替换为你的GitHub仓库地址）
git remote add origin https://github.com/your-username/guru-holdings-tracker.git

# 推送到main分支
git push -u origin main
```

### 2. 配置GitHub Pages

1. 进入GitHub仓库设置页面
2. 找到"Pages"选项
3. 在"Source"中选择"GitHub Actions"
4. 保存设置

### 3. 自动部署

- 每次推送到main分支时，GitHub Actions会自动构建和部署网站
- 部署完成后，网站将在 `https://your-username.github.io/guru-holdings-tracker/` 可访问

### 4. 自定义域名（可选）

如果你有自定义域名：

1. 在仓库根目录创建`CNAME`文件
2. 在文件中写入你的域名，如：`guru-holdings.example.com`
3. 在域名DNS设置中添加CNAME记录指向 `your-username.github.io`

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 注意事项

1. 确保`vite.config.js`中的`base`路径设置正确
2. 所有路由都使用相对路径
3. 图片和静态资源放在`public`目录下
4. 构建后的文件在`dist`目录中

## 故障排除

### 构建失败
- 检查所有依赖是否正确安装
- 确保没有语法错误
- 查看GitHub Actions日志获取详细错误信息

### 页面无法访问
- 确认GitHub Pages已启用
- 检查仓库是否为public（或有GitHub Pro账户）
- 等待几分钟让DNS生效

### 样式或功能异常
- 检查浏览器控制台是否有错误
- 确认所有资源路径正确
- 清除浏览器缓存后重试
