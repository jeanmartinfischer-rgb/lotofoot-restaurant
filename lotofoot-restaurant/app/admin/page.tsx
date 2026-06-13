{users?.map((u) => (
  <li key={u.id} className="flex items-center justify-between rounded-2xl border border-ligne bg-ardoise p-3 text-sm">
    <span className="font-semibold">
      {u.pseudo} {u.is_admin && '⭐'} {u.is_suspended && <span className="text-sang-vif">(suspendu)</span>}
    </span>
    <form action={toggleSuspend}>
      <input type="hidden" name="id" value={u.id} />
      <input type="hidden" name="suspended" value={String(u.is_suspended)} />
      <button className="rounded-lg border border-ligne px-3 py-1 text-xs font-semibold">
        {u.is_suspended ? 'Reactiver' : 'Suspendre'}
      </button>
    </form>
  </li>
))}
