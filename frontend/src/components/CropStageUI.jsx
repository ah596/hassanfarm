import { Button } from './ui';
import { OperationIcon } from './CropOperationsOverview';

export const stageMoney = value => `Rs. ${Number(value || 0).toLocaleString()}`;
export const stageDate = value => {
  if (!value) return 'No date recorded';
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export function StageSummary({ title, value, hint, badge, children }) {
  return <section className="crop-stage-summary">
    <div className="crop-stage-summary-top"><div><span className="crop-stage-eyebrow">{title}</span><strong>{value}</strong>{hint && <small>{hint}</small>}</div>{badge && <span className="crop-stage-next">{badge}</span>}</div>
    {children}
  </section>;
}

export function StageForm({ title, subtitle = 'Record in 3 simple steps', icon = 'leaf', onSubmit, children }) {
  return <form className="crop-stage-form" onSubmit={onSubmit}>
    <div className="crop-stage-form-heading"><span className="crop-stage-form-icon" aria-hidden="true"><OperationIcon kind={icon}/></span><div><h2>{title}</h2><p>{subtitle}</p></div><span className="crop-stage-step-badge">Step 3 of 3</span></div>
    <div className="crop-stage-form-body">{children}</div>
  </form>;
}

export function StageSection({ title, action, children }) {
  return <section className="crop-stage-section"><div className="crop-stage-section-heading"><h3>{title}</h3>{action}</div>{children}</section>;
}

export function StageTotal({ total, hint }) {
  return <div className="crop-stage-entry-total"><div><span className="crop-stage-eyebrow">Entry total</span><small>{hint}</small></div><strong>{stageMoney(total)}</strong></div>;
}

export function StageSave({ saving, editing, total, label, onCancel }) {
  return <div className="crop-stage-save"><Button type="submit" disabled={saving}>{saving ? 'Saving...' : <><span aria-hidden="true">✓</span> {editing ? 'Update' : 'Save'} {label}{total !== undefined ? ` (${stageMoney(total)})` : ''}</>}</Button>{editing && <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>}</div>;
}

export function StageHistory({ title, rows, emptyMessage, renderSubtitle, renderBreakdown, renderAmount, onEdit, onDelete, onView, onImage }) {
  const sorted = [...rows].sort((a, b) => (b.date || '').localeCompare(a.date || '') || String(b.id).localeCompare(String(a.id)));
  return <section className="crop-stage-history">
    <div className="crop-stage-history-heading"><h2><span aria-hidden="true">↶</span> {title}</h2><span>{rows.length} logged</span></div>
    <div className="crop-stage-history-list">{sorted.length ? sorted.map((row, index) => {
      const image = row.details?.receiptImage || row.details?.image;
      return <article className="crop-stage-record" key={row.id}>
        <div className="crop-stage-record-heading"><span className="crop-stage-record-number">{sorted.length - index}</span><div><h3>{row.details?.applicationNumber ? `${row.details.applicationNumber} · ${row.title}` : row.harvestNumber || row.title}</h3><p>{renderSubtitle?.(row) || row.notes || 'Recorded application'}</p></div><span className="crop-stage-record-badge">{image ? 'Receipt attached' : 'Logged'}</span></div>
        <div className="crop-stage-record-total"><div><time>{stageDate(row.date)}</time><small>{renderBreakdown?.(row)}</small></div><strong>{renderAmount ? renderAmount(row) : stageMoney(row.totalCost)}</strong></div>
        <details className="crop-stage-record-options"><summary>Record options</summary><div>{onView && <Button type="button" variant="secondary" onClick={() => onView(row)}>Details</Button>}{image && onImage && <Button type="button" variant="secondary" onClick={() => onImage(image)}>View receipt</Button>}{onEdit && <Button type="button" variant="secondary" onClick={() => onEdit(row)}>Edit</Button>}{onDelete && <Button type="button" variant="danger" onClick={() => onDelete(row.id)}>Delete</Button>}</div></details>
      </article>;
    }) : <div className="crop-stage-empty">{emptyMessage || 'No records yet.'}</div>}</div>
  </section>;
}
