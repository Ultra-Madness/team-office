      {boardOpen && (
        <div className="of-board-bg" onPointerDown={(e: any) => { if (e.target === e.currentTarget) setBoardOpen(false); }} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.55)", zIndex: 50, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "24px 10px", overflowY: "auto" }}>
          <div className="of-board" role="dialog" aria-modal="true" aria-label="Team Board" style={{ background: th.bg.elevated, color: th.text.primary, border: `1px solid ${th.border.default}`, borderRadius: 14, padding: 16, width: "100%", maxWidth: 1000, boxShadow: "0 10px 40px rgba(0,0,0,.35)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <div style={{ fontSize: 18, fontWeight: 700, flex: 1 }}>Team Board <span style={{ fontSize: 13, fontWeight: 400, color: th.text.tertiary }}>· {BOARD.cards.length} cards · as of {BOARD.asOf}</span></div>
              <button className="of-board-close" onClick={() => setBoardOpen(false)} aria-label="Close Team Board" style={{ cursor: "pointer", padding: "4px 12px", borderRadius: 8, border: `1px solid ${th.border.default}`, background: "transparent", color: th.text.primary, fontSize: 14 }}>✕ Close</button>
            </div>
            {BOARD.waitingOnMichael && <div style={{ fontSize: 13, color: "#92400E", background: "#FEF3C7", borderRadius: 8, padding: "4px 8px", marginBottom: 6, display: "inline-block" }}>⚠ {BOARD.waitingOnMichael}</div>}
            {BOARD.sprintGoal && <div style={{ fontSize: 13, color: th.text.secondary, marginBottom: 10 }}>{BOARD.sprintGoal}</div>}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
              {BOARD_COLS.map((col: any) => {
                const list = BOARD.cards.filter((c: any) => col.statuses.includes(c.status)).sort((a: any, b: any) => col.statuses.indexOf(a.status) - col.statuses.indexOf(b.status));
                return (
                  <div key={col.label} style={{ background: th.bg.subtle, border: `1px solid ${th.border.subtle}`, borderRadius: 10, padding: 10 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{col.label} <span style={{ color: th.text.tertiary, fontWeight: 400 }}>({list.length})</span></div>
                    {list.length === 0 && <div style={{ fontSize: 13, color: th.text.tertiary }}>No cards</div>}
                    {list.map((c: any, i: number) => (
                      <div key={i} style={{ borderLeft: `4px solid ${ROLE_COLOR[c.role] || "#9CA3AF"}`, background: th.bg.base, borderRadius: 6, padding: "6px 8px", marginBottom: 6, fontSize: 13 }}>
                        <div style={{ fontWeight: 600 }}>{c.title}</div>
                        <div style={{ color: th.text.secondary, fontSize: 12 }}>Owner: {ROLE_NAME[c.role] || c.role || "unassigned"} · Status: {c.status}{c.sprint ? " · " + c.sprint : ""}</div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
