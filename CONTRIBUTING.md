# Contributing to Corporate Travel Admin Portal

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## 🤝 How to Contribute

### Reporting Bugs
- Check if the bug has already been reported in Issues
- Use the bug report template
- Include screenshots and steps to reproduce
- Specify your environment (OS, browser, Node version)

### Suggesting Features
- Check if the feature has been suggested
- Clearly describe the feature and its benefits
- Provide examples or mockups if possible

### Code Contributions

#### 1. Fork the Repository
```bash
git clone https://github.com/yourusername/admin-portal.git
cd admin-portal
```

#### 2. Create a Branch
```bash
git checkout -b feature/your-feature-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `style/` - UI/styling changes
- `refactor/` - Code refactoring

#### 3. Make Your Changes
- Follow the existing code style
- Write clean, readable code
- Add comments for complex logic
- Test your changes thoroughly

#### 4. Commit Your Changes
```bash
git add .
git commit -m "feat: add new feature description"
```

Commit message format:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `style:` - Formatting, styling
- `refactor:` - Code restructuring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

#### 5. Push to Your Fork
```bash
git push origin feature/your-feature-name
```

#### 6. Create a Pull Request
- Provide a clear description of changes
- Reference any related issues
- Include screenshots for UI changes
- Ensure all tests pass

## 📝 Code Style Guidelines

### JavaScript/React
- Use functional components with hooks
- Follow React best practices
- Use meaningful variable names
- Keep components small and focused
- Use PropTypes or TypeScript for type checking

### CSS/Styling
- Use Tailwind CSS utility classes
- Follow the existing design system
- Maintain the purple gradient theme
- Ensure responsive design
- Test on multiple screen sizes

### File Organization
```
src/
├── components/     # Reusable components
├── pages/          # Page components
├── utils/          # Utility functions
├── hooks/          # Custom hooks
└── styles/         # Global styles
```

## 🧪 Testing

Before submitting:
- Test on Chrome, Firefox, and Safari
- Test responsive design (mobile, tablet, desktop)
- Check console for errors
- Verify all features work as expected

## 📋 Pull Request Checklist

- [ ] Code follows project style guidelines
- [ ] Changes are tested and working
- [ ] Documentation is updated
- [ ] Commit messages are clear
- [ ] No console errors or warnings
- [ ] Responsive design is maintained
- [ ] Accessibility is considered

## 🎨 Design Guidelines

### Colors
- Primary: `#7c3aed` (Purple 600)
- Secondary: `#6d28d9` (Purple 700)
- Use the existing color palette

### Typography
- Headings: Bold, clear hierarchy
- Body: Readable font size (14-16px)
- Use consistent spacing

### Components
- Follow existing component patterns
- Maintain consistent styling
- Ensure accessibility (ARIA labels, keyboard navigation)

## 🐛 Bug Fix Guidelines

1. Identify the root cause
2. Write a test that reproduces the bug
3. Fix the bug
4. Verify the test passes
5. Check for side effects

## ✨ Feature Development

1. Discuss the feature in an issue first
2. Get approval from maintainers
3. Design the feature (mockups if needed)
4. Implement incrementally
5. Document the feature
6. Add examples/demos

## 📚 Documentation

- Update README.md for major changes
- Add JSDoc comments for functions
- Update QUICK_START.md if setup changes
- Include inline comments for complex code

## 🔍 Code Review Process

1. Maintainers will review your PR
2. Address any feedback or requested changes
3. Once approved, your PR will be merged
4. Your contribution will be credited

## 💡 Best Practices

### Performance
- Optimize images and assets
- Minimize bundle size
- Use lazy loading where appropriate
- Avoid unnecessary re-renders

### Security
- Never commit sensitive data
- Validate user inputs
- Follow security best practices
- Use environment variables for secrets

### Accessibility
- Use semantic HTML
- Add ARIA labels
- Ensure keyboard navigation
- Test with screen readers

## 🎯 Priority Areas

We especially welcome contributions in:
- [ ] Unit tests
- [ ] E2E tests
- [ ] Performance optimizations
- [ ] Accessibility improvements
- [ ] Documentation
- [ ] Bug fixes

## 📞 Getting Help

- Open an issue for questions
- Join our community discussions
- Check existing documentation
- Review closed issues and PRs

## 🙏 Recognition

All contributors will be:
- Listed in the contributors section
- Credited in release notes
- Appreciated by the community!

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for making this project better! 🚀**
