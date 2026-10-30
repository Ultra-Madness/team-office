      {OFFICE.team.map((m: any) => { const d = DESK[m.key]; return (
        <div key={m.key + "pl"} className="of-plbl" data-of-hit="1" onClick={() => tapPerson(m.key)} style={{ left: (d.x / 10) + "%", top: (((d.y + 33) / 580) * 100) + "%", borderColor: m.color }}>
          <b>{m.name}</b><span>{m.role}</span><i>{m.now}</i>
        </div>); })}
