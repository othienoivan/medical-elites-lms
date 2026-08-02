# RC4 Test Checklist

## Public pages
- [ ] Home page displays Our Partners.
- [ ] About Us opens from navbar/footer.
- [ ] Privacy Policy opens.
- [ ] Terms & Conditions opens.
- [ ] Testimonials page opens.
- [ ] Contact page opens and prepares an email.
- [ ] Footer shows copyright and founder credit.

## Authentication
- [ ] Student portal login routes student to /dashboard.
- [ ] Tutor portal login routes tutor to /tutor.
- [ ] Administrator portal login routes admin to /tutor.
- [ ] Wrong portal selection signs the user out and displays a clear message.
- [ ] Student registration creates an active student profile.
- [ ] Tutor registration creates an inactive request pending approval.
- [ ] Administrator registration is not public and redirects to a contact request.

## Regression
- [ ] Existing student and tutor workflows remain available.
- [ ] Firestore rules deploy successfully.
- [ ] npm run lint passes.
- [ ] npm run typecheck passes.
- [ ] npm run build passes.
