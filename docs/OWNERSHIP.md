# Business ownership review

1. A signed-in user submits a new business or requests a claim for an existing verified listing. The claim starts as `PENDING`. The user's account email is **not verified** by this release.
2. An administrator examines the business name, address, coordinates, category, and potential duplicates. OSM imports are review candidates, never auto-published. Moderators can resolve user reports but cannot approve or reject businesses or claims.
3. For a claim, contact the business through a phone number or website obtained independently from the claim. Do not use the claimant's unverified account email or a self-supplied address as sole proof. Ask for a response through that official channel or equivalent documentary evidence.
4. Record the verification method and result in the approval note. The API requires a note of at least 20 characters for both business and claim approvals and writes it to the audit log. Reject insufficient evidence.
5. Approving a claim grants editing rights to that user for that business only. Approving a business makes it searchable. A later owner change to the name or address sends the listing back to review.
6. Recheck ownership when a dispute or suspicious report arrives. The current UI has no automated dispute workflow; an administrator must resolve it manually.

Never treat a business's location or public address as proof of ownership. Add email verification and a formal document or phone verification workflow before controlled release.
