"use client";
import { Checkbox } from "@/components/checkbox";
import { Select } from "@/components/select";
import Link from "next/link";
import { useState } from "react";
type Hour = {
  weekday: number;
  openMinute: number;
  closeMinute: number;
  isClosed: boolean;
};
type Exception = Omit<Hour, "weekday"> & { localDate: string };
type Item = {
  id: string;
  status: string;
  business: {
    id: string;
    name: string;
    address: string;
    verification: string;
    temporarilyClosed: boolean;
    hours: Hour[];
    exceptions: Exception[];
  };
};
const weekdays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];
function minutes(value: string) {
  const [h, m] = value.split(":").map(Number);
  return h * 60 + m;
}
function clock(value: number) {
  return `${String(Math.floor(value / 60) % 24).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
}
export function HoursEditor({ item }: { item: Item }) {
  const [rows, setRows] = useState<Hour[]>(
    weekdays.flatMap((_, weekday) => {
      const existing = item.business.hours.filter((h) => h.weekday === weekday);
      return existing.length
        ? existing
        : [
            {
              weekday,
              openMinute: 540,
              closeMinute: 1080,
              isClosed: true,
            },
          ];
    }),
  );
  const [exceptions, setExceptions] = useState<Exception[]>(
    item.business.exceptions,
  );
  const [exceptionDate, setExceptionDate] = useState("");
  const [exceptionOpen, setExceptionOpen] = useState("09:00");
  const [exceptionClose, setExceptionClose] = useState("18:00");
  const [exceptionClosed, setExceptionClosed] = useState(false);
  const [message, setMessage] = useState("");
  const [closed, setClosed] = useState(item.business.temporarilyClosed);
  const [selectedDay, setSelectedDay] = useState(1);
  async function save() {
    const response = await fetch(
      `/api/v1/businesses/${item.business.id}/hours`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(rows),
      },
    );
    setMessage(
      response.ok
        ? "Hours saved. They may be rechecked by Open24."
        : "Could not save hours",
    );
  }
  async function toggleClosure() {
    const response = await fetch(`/api/v1/businesses/${item.business.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ temporarilyClosed: !closed }),
    });
    if (response.ok) {
      setClosed(!closed);
      setMessage("Temporary closure updated");
    } else setMessage("Could not update closure");
  }
  async function saveExceptions() {
    const response = await fetch(
      `/api/v1/businesses/${item.business.id}/exceptions`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(exceptions),
      },
    );
    setMessage(
      response.ok ? "Special dates saved." : "Could not save special dates",
    );
  }
  return (
    <div>
      <h3>Opening hours</h3>
      <p>
        For overnight hours, enter a closing time earlier than the opening time
        (for example 22:00 to 02:00). For 24 hours, select 24/7 below.
      </p>
      <div style={{ display: "grid", gap: 8 }}>
        {rows.map((h, i) => (
          <div
            key={`${h.weekday}-${i}`}
            className="field-row"
            style={{
              alignItems: "center",
              gridTemplateColumns: "110px 70px 1fr 1fr auto",
            }}
          >
            <strong style={{ fontSize: 13 }}>{weekdays[h.weekday]}</strong>
            <Checkbox
              className="checkbox-sm"
              label="Open"
              checked={!h.isClosed}
              onChange={(e) =>
                setRows(
                  rows.map((r, n) =>
                    n === i ? { ...r, isClosed: !e.target.checked } : r,
                  ),
                )
              }
            />
            <input
              type="time"
              value={clock(h.openMinute)}
              disabled={h.isClosed}
              aria-label={`${weekdays[h.weekday]} interval ${i + 1} opening`}
              onChange={(e) =>
                setRows(
                  rows.map((r, n) =>
                    n === i ? { ...r, openMinute: minutes(e.target.value) } : r,
                  ),
                )
              }
            />
            <input
              type="time"
              value={clock(h.closeMinute)}
              disabled={h.isClosed}
              aria-label={`${weekdays[h.weekday]} interval ${i + 1} closing`}
              onChange={(e) =>
                setRows(
                  rows.map((r, n) =>
                    n === i
                      ? { ...r, closeMinute: minutes(e.target.value) }
                      : r,
                  ),
                )
              }
            />
            <button
              type="button"
              className="button button-outline button-small"
              aria-label={`Remove ${weekdays[h.weekday]} interval ${i + 1}`}
              onClick={() => setRows(rows.filter((_, n) => n !== i))}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <div className="detail-actions">
        <Select
          aria-label="Day for new opening interval"
          value={selectedDay}
          onChange={(event) => setSelectedDay(Number(event.target.value))}
        >
          {weekdays.map((day, i) => (
            <option value={i} key={day}>
              {day}
            </option>
          ))}
        </Select>
        <button
          className="button button-outline button-small"
          onClick={() => {
            if (rows.length < 28)
              setRows([
                ...rows,
                {
                  weekday: selectedDay,
                  openMinute: 540,
                  closeMinute: 1080,
                  isClosed: false,
                },
              ]);
          }}
        >
          Add interval
        </button>
        <button className="button button-small" onClick={save}>
          Save hours
        </button>
        <button
          className="button button-outline button-small"
          onClick={() =>
            setRows(
              weekdays.map((_, weekday) => ({
                weekday,
                isClosed: false,
                openMinute: 0,
                closeMinute: 1440,
              })),
            )
          }
        >
          Set 24/7
        </button>
        <button
          className="button button-outline button-small"
          onClick={toggleClosure}
        >
          {closed ? "Reopen business" : "Mark temporarily closed"}
        </button>
      </div>
      <h3>Special dates and holidays</h3>
      <p>
        These dates override the weekly hours. A closed date also cancels hours
        carried over from the previous night.
      </p>
      {exceptions.map((row, index) => (
        <div className="field-row" key={`${row.localDate}-${index}`}>
          <strong>{row.localDate}</strong>
          <span>
            {row.isClosed
              ? "Closed"
              : `${clock(row.openMinute)}–${clock(row.closeMinute)}`}
          </span>
          <button
            type="button"
            className="button button-outline button-small"
            onClick={() =>
              setExceptions(exceptions.filter((_, i) => i !== index))
            }
          >
            Remove
          </button>
        </div>
      ))}
      <div className="field-row">
        <label>
          Date{" "}
          <input
            type="date"
            value={exceptionDate}
            onChange={(event) => setExceptionDate(event.target.value)}
          />
        </label>
        <Checkbox
          label="Closed"
          checked={exceptionClosed}
          onChange={(event) => setExceptionClosed(event.target.checked)}
        />
        <label>
          Opens{" "}
          <input
            type="time"
            value={exceptionOpen}
            disabled={exceptionClosed}
            onChange={(event) => setExceptionOpen(event.target.value)}
          />
        </label>
        <label>
          Closes{" "}
          <input
            type="time"
            value={exceptionClose}
            disabled={exceptionClosed}
            onChange={(event) => setExceptionClose(event.target.value)}
          />
        </label>
      </div>
      <div className="detail-actions">
        <button
          type="button"
          className="button button-outline button-small"
          onClick={() => {
            if (!exceptionDate || exceptions.length >= 60) return;
            if (
              exceptionClosed &&
              exceptions.some((row) => row.localDate === exceptionDate)
            ) {
              setMessage("Remove other intervals for this date first.");
              return;
            }
            if (
              !exceptionClosed &&
              exceptions.some(
                (row) => row.localDate === exceptionDate && row.isClosed,
              )
            ) {
              setMessage("Remove the closed date first.");
              return;
            }
            setExceptions([
              ...exceptions,
              {
                localDate: exceptionDate,
                isClosed: exceptionClosed,
                openMinute: minutes(exceptionOpen),
                closeMinute: minutes(exceptionClose),
              },
            ]);
            setExceptionDate("");
          }}
        >
          Add special date
        </button>
        <button
          type="button"
          className="button button-small"
          onClick={saveExceptions}
        >
          Save special dates
        </button>
      </div>
      {message && (
        <p className="notice" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
export function OwnerDashboard({ initial }: { initial: Item[] }) {
  return (
    <div className="page-shell">
      <div className="container">
        <div className="page-heading">
          <span className="eyebrow">BUSINESS OWNER</span>
          <h1>Business dashboard</h1>
          <p>Manage profiles after Open24 verifies your ownership.</p>
        </div>
        <div className="detail-actions">
          <Link className="button button-small" href="/business/register">
            Add a business
          </Link>
          <Link className="button button-outline button-small" href="/explore">
            Find a business to claim
          </Link>
        </div>
        {initial.length === 0 && (
          <div className="empty">No businesses or claims yet.</div>
        )}
        {initial.map((item) => (
          <div
            className="panel content-card"
            style={{ marginBottom: 18 }}
            key={item.id}
          >
            <h2>{item.business.name}</h2>
            <p>{item.business.address}</p>
            <p>
              <strong>Listing:</strong> {item.business.verification} ·{" "}
              <strong>Ownership:</strong> {item.status}
            </p>
            {item.status === "VERIFIED" && (
              <>
                <Link
                  className="button button-outline button-small"
                  href={"/business/manage/" + item.business.id}
                >
                  Manage profile
                </Link>
                <HoursEditor item={item} />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
