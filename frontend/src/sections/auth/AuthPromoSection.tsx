const benefits = [
  "Projects and tasks in one clear workspace.",
  "Role-based access for owners, admins, members and viewers.",
  "A live dashboard to track progress at a glance.",
  "Secure sign-in with token-based authentication.",
];

export function AuthPromoSection() {
  return <section className="hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-700 p-10 text-white lg:flex">
    <div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-xl">✈</span><span className="text-2xl font-bold">TaskFlow</span></div>
    <div className="max-w-lg"><h2 className="text-4xl font-bold leading-tight">Plan together. Ship faster.</h2><p className="mt-4 text-lg text-indigo-100">TaskFlow is a collaborative project and task manager that keeps your whole team aligned, from the first idea to the final release.</p>
      <ul className="mt-8 space-y-4 text-indigo-50">{benefits.map((benefit) => <li key={benefit} className="flex gap-3"><span aria-hidden="true" className="text-green-300">✔</span><span>{benefit}</span></li>)}</ul>
      <div className="mt-10 grid grid-cols-3 gap-4 text-center">{[["10x", "clearer planning"], ["4", "access roles"], ["24/7", "team visibility"]].map(([value, label]) => <div key={value} className="rounded-xl bg-white/10 p-4"><p className="text-2xl font-bold">{value}</p><p className="text-sm text-indigo-100">{label}</p></div>)}</div>
    </div>
    <p className="text-sm text-indigo-200">Trusted by teams who want less chaos and more done.</p>
  </section>;
}
