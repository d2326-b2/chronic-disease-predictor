# Security Policy

## Reporting Security Vulnerabilities

We take security seriously. If you discover a security vulnerability, please email us privately instead of using the issue tracker.

**Email**: [security@example.com] (Replace with actual security contact)

Please include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.0   | ✅ Yes    |
| < 1.0   | ❌ No     |

## Security Best Practices

### For Users
1. **Keep dependencies updated**: Run `pip install --upgrade -r requirements.txt` regularly
2. **Use HTTPS**: Always use HTTPS when deploying to production
3. **Protect credentials**: Never commit `.env` files or secrets
4. **Validate inputs**: Always validate health data inputs
5. **Regular backups**: Backup your reports and data regularly

### For Developers
1. **Dependency scanning**: We use automated scanning for vulnerable packages
2. **Code review**: All contributions go through peer review
3. **Secure coding**: Follow OWASP guidelines
4. **Update regularly**: Keep dependencies current
5. **Test security**: Use tools like `bandit` for Python security checks

## Known Security Considerations

### Data Privacy
- This application does NOT store personal health information on servers
- All health data is processed client-side in the browser
- PDF reports are automatically deleted after 24 hours from the server
- No database is required or used for storing patient data

### Cloudflare Tunnel
- Provides automatic DDoS protection
- Uses TLS encryption for all connections
- One-time setup, no authentication credentials exposed

### CORS Configuration
- Configured for security by default
- Adjust based on your deployment needs

## Dependency Security

We maintain up-to-date dependencies:

```bash
# Check for vulnerable packages
pip install safety
safety check

# Or using pip-audit
pip install pip-audit
pip-audit
```

## Incident Response

If a vulnerability is discovered:
1. We will acknowledge receipt within 48 hours
2. We will assess severity and impact
3. We will develop a fix and test it
4. We will release a patch
5. We will credit the reporter (if they wish)

If a vulnerability is discovered:
1. We will acknowledge receipt within 48 hours
2. We will assess severity and impact
3. We will develop a fix and test it
4. We will release a patch
5. We will credit the reporter (if they wish)

## Security Headers

For production deployment, consider adding:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Content-Security-Policy: appropriate policy

## Third-Party Dependencies

We regularly audit all third-party dependencies:

- **Flask**: Web framework - actively maintained
- **scikit-learn**: ML library - actively maintained
- **joblib**: Data serialization - actively maintained
- **numpy**: Numerical computing - actively maintained
- **jsPDF**: PDF generation - actively maintained

## Compliance

This project aims to comply with:
- HIPAA (for healthcare data handling)
- GDPR (for user privacy in EU)
- CCPA (for user privacy in California)

## Contact

For security policy inquiries: [security@example.com]

---

Last Updated: April 2026
