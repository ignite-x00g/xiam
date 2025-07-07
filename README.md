# OPS Online Support

This repository contains the front-end assets for the OPS Online Support site.

## Recommended Security Headers

Configure your web server to set security-related HTTP headers. Two important headers are:

### Content Security Policy (CSP)
```
Content-Security-Policy: default-src 'self'; script-src 'self' https://cdnjs.cloudflare.com; style-src 'self' https://cdnjs.cloudflare.com; img-src 'self' data:;
```
Adjust the policy to match your resources.

### HTTP Strict Transport Security (HSTS)
```
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```
Only enable HSTS once HTTPS is fully deployed.

A sample Nginx configuration snippet:
```
add_header Content-Security-Policy "default-src 'self';";
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";
```
