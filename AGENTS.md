<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep TanStack Router trailing slashes in `preserve` mode because FTP prerender requests directory-style URLs while existing public links omit the slash.
- Advance displayed image fallbacks only on confirmed browser errors, keep retry URLs stable, and check cached image completion after hydration; slow or deferred loading must not discard valid photos.
