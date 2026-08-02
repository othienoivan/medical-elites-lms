# Domain architecture

All new Medical Elites Platform code is organised by business domain.

Each domain may contain:

- `domain/`: entities, value objects, policies and repository contracts. No React or Firebase imports.
- `application/`: use cases and orchestration. Depends on its own domain and the shared kernel.
- `infrastructure/`: Firebase, HTTP and external-provider adapters implementing domain contracts.
- `presentation/`: React components, pages and hooks. Calls application services; it must not query Firebase directly.

## Dependency direction

`presentation -> application -> domain`

`infrastructure -> domain`

The domain layer must never import presentation or infrastructure code. Cross-domain use goes through public domain exports or application ports, not internal files.

The existing LMS remains in its current folders during migration. New SaaS work starts here, and legacy features move one bounded context at a time after regression tests pass.
