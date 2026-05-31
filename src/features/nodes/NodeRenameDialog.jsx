import React from 'react';

function cleanTitle(value) {
  return String(value || '').trim();
}

export function NodeRenameDialog({ node, onConfirm, onClose }) {
  const [draft, setDraft] = React.useState(() => cleanTitle(node?.title));

  React.useEffect(() => {
    setDraft(cleanTitle(node?.title));
  }, [node?.id, node?.title]);

  if (!node?.id) return null;

  const title = cleanTitle(draft);
  const submit = (event) => {
    event.preventDefault();
    if (!title) return;
    onConfirm?.(node.id, title);
  };

  return (
    <div className="modal-mask" onClick={onClose} role="presentation">
      <form className="modal group-name-modal" onClick={(event) => event.stopPropagation()} onSubmit={submit}>
        <header>
          <h2>重命名节点</h2>
          <button type="button" className="close" onClick={onClose}>关闭</button>
        </header>
        <div className="body group-name-body">
          <label className="group-name-field">
            <span>节点名称</span>
            <input
              autoFocus
              name="nodeTitle"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onFocus={(event) => event.currentTarget.select()}
              placeholder="未命名节点"
            />
          </label>
          <div className="group-name-actions">
            <button type="button" className="x-btn ghost" onClick={onClose}>取消</button>
            <button type="submit" className="x-btn primary" disabled={!title}>保存名称</button>
          </div>
        </div>
      </form>
    </div>
  );
}
