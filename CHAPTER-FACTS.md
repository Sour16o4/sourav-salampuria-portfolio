# Claims to verify while the cluster is up

The six case-study chapters in `src/content/platform.json` are **drafted**. The storyboard
gave me the chapter titles and a one-line tradeoff topic each; the prose is mine, extrapolated
from the technical facts in the spec.

That extrapolation put specific, falsifiable claims on your site. Below is every one of them.
Work through it with the cluster and the repo open — most of these are one command each.

**Anything you tick is now true. Anything you cannot tick must be rewritten or cut.** A
reviewer who is interested enough to read the case study is interested enough to open the
repo, and a confident sentence that turns out to be wrong costs more than a missing one.

---

## Chapter 1 — Pinning ingress to the control plane

- [ ] The cluster is exactly **three nodes** — `kubectl get nodes`
- [ ] There is **no cloud load balancer** in front of it — no `Service` of type `LoadBalancer` with an external IP
- [ ] The ingress controller is pinned to the control-plane node with a **`nodeSelector`**
- [ ] It also carries a **toleration for the control-plane taint**
- [ ] **DNS points at that node's address** (this is the reason the pin exists)
- [ ] The cost argument is real for you — a managed LB would cost more per month than the rest of the infrastructure

`kubectl -n <ingress-ns> get deploy -o yaml | grep -A8 -E 'nodeSelector|tolerations'`

## Chapter 2 — 6.45 MB, non-root, read-only rootfs

- [ ] Runtime base is **`scratch`** (the draft says scratch, *not* distroless or Alpine — if it is distroless, two paragraphs are wrong)
- [ ] The Go binary is **statically linked**
- [ ] There is **no shell, no package manager, no libc** in the image
- [ ] It runs as **UID 10001**
- [ ] That user has **no login shell and no home directory**
- [ ] Root filesystem is mounted **read-only** (`readOnlyRootFilesystem: true`)
- [ ] **All Linux capabilities dropped** (`capabilities.drop: [ALL]`)
- [ ] The image really is **6.45 MB**
- [ ] `kubectl exec` into it genuinely gives you nothing

`kubectl get pod <pod> -o jsonpath='{.spec.containers[0].securityContext}'`

## Chapter 3 — Monitoring ships with the chart

- [ ] The chart renders **Deployment, Service, Ingress**
- [ ] The chart renders a **`ServiceMonitor`**
- [ ] The chart renders a **Grafana dashboard as a ConfigMap carrying the sidecar label**
- [ ] The chart therefore **assumes Prometheus Operator is installed**
- [ ] …and **assumes the Grafana dashboard sidecar is installed**
- [ ] The dashboard is versioned alongside the code that emits the metrics

`helm template ./chart | grep -E '^kind:' | sort | uniq -c`

## Chapter 4 — The write-back loop

- [ ] CI tags the image with the **commit SHA**
- [ ] It pushes to **GHCR**
- [ ] CI **commits the new tag into `values.yaml`**
- [ ] …and pushes it **back into the same repository** that triggered it
- [ ] The loop is cut with **`paths-ignore` on the values file, at the trigger** — not with an early exit inside the job
- [ ] The bot commit is **marked in the commit message**
- [ ] The job **also checks the author** as a second line of defence
- [ ] You actually hit the infinite loop (the draft implies you did, and that it was expensive)

## Chapter 5 — Trivy gating

- [ ] Trivy runs against the built image **before it is pushed**
- [ ] The job **fails on HIGH or CRITICAL**
- [ ] Because the scan precedes the push, a vulnerable tag **never reaches the registry**
- [ ] **Unfixed vulnerabilities are ignored** (`--ignore-unfixed`) — this is the chapter's sharpest claim and its stated weakness
- [ ] Unfixed findings are still **visible in the scan output**, just non-blocking

## Chapter 6 — Verifying self-healing

Rewritten to stand without the recording. The dangling reference is gone, but the rewrite
leans on specificity to do the work the video used to do — which means **more** claims to
check, not fewer:

- [ ] The ArgoCD Application has **`selfHeal: true`**
- [ ] The drift test is **`kubectl scale` run by hand against the live cluster**
- [ ] You scale **up** (the draft says `--replicas=5`) rather than down — change it if not
- [ ] ArgoCD flips to **OutOfSync within seconds**, not on the 3-minute reconciliation timeout. If yours only reverts on the timer, "within seconds" is wrong and the paragraph loses its punch
- [ ] The revert happens with **no pull request and nobody clicking Sync**
- [ ] The extra pods **terminate** and the replica count returns to the value in `values.yaml`
- [ ] The tradeoff's failure list is honest for your setup — no secrets mutated post-read, no node-level drift, no admission webhook rewriting objects

---

## Metrics

These four came from you and are used verbatim in `home.json` and `platform.json`. Confirm
they are still current:

- [ ] `6.45` MB image size
- [ ] `3` cluster nodes
- [ ] `10001` runtime UID
- [ ] `5` endpoints

One derived value: the primary work entry shows **`7` pipeline stages**, taken from the
storyboard's seven-stage pipeline.

## "What I'd do differently"

These four bullets assert **absences**, so they are wrong if you have since fixed them:

- [ ] Deployment config is **not** yet split into its own repository
- [ ] Images are **not** signed, and there is **no** admission-time signature verification
- [ ] The Helm chart has **no** tests — nothing asserts the ServiceMonitor selector still matches the Service labels
- [ ] You **never wrote down** the traffic threshold at which the ingress pin stops being the right call

---

## `src/content/book-api.json`

Drafted end to end apart from the title and `5 endpoints · 4 layers`.

- [ ] The five endpoints are exactly: `GET /books` (paginated), `GET /books/{id}`, `POST /books`, `PUT /books/{id}` (replace), `DELETE /books/{id}`
- [ ] Pagination really is implemented on the list endpoint
- [ ] The four layers are named **transport, service, repository, storage**
- [ ] The **repository interface is declared by the service layer** and implemented below it
- [ ] Sentinel errors live in the **domain package**, wrapped with `fmt.Errorf` + `%w`
- [ ] Transport unwraps with **`errors.Is`** and maps to status codes in **exactly one place**

## `src/content/about.json`

Voice rather than fact, so nothing here is falsifiable — but it is my voice, not yours.
Rewrite it before it goes out.
