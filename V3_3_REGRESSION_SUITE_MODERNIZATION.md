# Medical Elites LMS v3.3 Regression Suite Modernization

## Scope

The complete `tests/` directory was reviewed against the v3.3 Knowledge Center baseline.

- Test files reviewed: 47 existing files
- New quality-guard file: 1
- Total regression tests after modernization: 184
- Result: 184 passed, 0 failed

## Modernized tests

### Student Learning Library and Professionalization roadmap

Replaced assertions tied to the exact variable name `currentUser.uid` with capability-level assertions that verify:

- the protected library route exists;
- purchases are loaded through `MarketplaceCommerceService`;
- only active ownership records are included;
- product metadata is resolved;
- owned products route to an appropriate destination;
- global search and Commerce Asset compatibility remain present.

### Tutor storefront

The storefront assertion now accepts the stable `/store/me` route as well as a dynamically resolved tutor storefront route, rather than requiring one exact template-variable implementation.

### Tutor authoring ownership

Ownership tests now verify that lesson creation writes authenticated UID-based ownership fields without requiring the local authentication variable to be named `currentUser`.

### Module progress loading

The enrollment query test now verifies that progress is scoped by `studentId` without depending on a specific local variable name.

## Regression quality guards

Added `tests/regression-suite-quality.test.mjs` to prevent future tests from:

- requiring `currentUser.uid` or `authenticatedUser.uid` in source code;
- coupling enrollment queries to a local authentication variable name;
- referencing superseded source paths such as the former shared header or hyphenated Commerce Asset model path.

## Testing policy

Regression tests should validate stable contracts and observable capabilities:

- routes;
- service calls;
- security rules;
- ownership and tenant constraints;
- workflow states;
- exported domain capabilities;
- user-facing actions.

They should avoid enforcing incidental implementation details such as local variable names, formatting, line structure, or one historical file path when a canonical replacement exists.
