{events.map((e, i) => {
                const isGoal = e.event_type === 'Goal';
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-3 rounded-xl p-2.5 ${
                      isGoal
                        ? 'bg-sang/25 border-2 border-sang-vif'
                        : 'glass'
                    }`}
                  >
                    {/* Colonne temps */}
                    <div className="flex flex-col items-center w-10 shrink-0">
                      <span className="text-lg leading-none"><EventIcon type={e.event_type} detail={e.detail} /></span>
                      <span className="font-mono text-[11px] text-chalk/60 mt-0.5">
                        {e.minute}{e.extra_minute ? '+' + e.extra_minute : ''}'
                      </span>
                    </div>

                    {/* Photo joueur (initiales pour l'instant, photo des que player_id existe) */}
                    <PastilleJoueur nom={e.player} playerId={(e as any).player_id ?? null} taille={36} />

                    {/* Detail de l'action */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {isGoal && (
                          <span className="rounded-md bg-sang-vif px-2 py-0.5 font-display text-xs font-bold text-chalk shrink-0">
                            BUT
                          </span>
                        )}
                        <p className={`truncate ${isGoal ? 'font-bold text-base text-chalk' : 'font-semibold text-sm'}`}>
                          {e.player}
                        </p>
                      </div>
                      {e.assist && e.event_type === 'Goal' && (
                        <p className="text-xs text-chalk/60 truncate">Passe : {e.assist}</p>
                      )}
                      {e.event_type === 'subst' && (
                        <p className="text-xs text-chalk/50 truncate">Entre : {e.assist}</p>
                      )}
                      {e.detail === 'Penalty' && (
                        <p className="text-xs text-chalk/60 truncate">Sur penalty</p>
                      )}
                      {e.detail === 'Own Goal' && (
                        <p className="text-xs text-sang-vif truncate">Contre son camp</p>
                      )}
                      {!isGoal && <p className="text-xs text-chalk/40 truncate">{e.detail}</p>}
                    </div>

                    {/* Equipe */}
                    <span className="font-mono text-[10px] text-chalk/40 text-right shrink-0 max-w-[80px] truncate">
                      {e.team}
                    </span>
                  </div>
                );
              })}
