---
"@itwin/itwins-client": patch
---

Allow credentials for HTTPS Bentley capability URIs

Authorization is retained for `bentley.com` and its subdomains when using
repository capability URIs and following redirects. Authorization is stripped
from requests to non-Bentley domains.
