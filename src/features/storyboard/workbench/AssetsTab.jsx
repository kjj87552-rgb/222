import React from 'react';
import { AssetCharacterCard } from './components/AssetCharacterCard.jsx';
import { AssetSceneCard } from './components/AssetSceneCard.jsx';
import { AssetPropCard } from './components/AssetPropCard.jsx';
import {
  projectAssetsActions,
  projectAssetsStore,
  makeAssetId,
  saveProjectAssets,
} from '../../../shared/store/projectAssetsStore.js';
import { PromptStore } from '../../../shared/platform/promptStore.js';

export function AssetsTab({ projectId, assets }) {
  const persistCurrentAssets = React.useCallback(() => {
    if (!projectId) return;
    const current = projectAssetsStore.getState().byProject.get(projectId);
    if (!current) return;
    void saveProjectAssets(projectId, current, PromptStore);
  }, [projectId]);

  const commitAssetChange = React.useCallback((applyChange) => {
    applyChange();
    persistCurrentAssets();
  }, [persistCurrentAssets]);

  const handleAddCharacter = () => {
    commitAssetChange(() => projectAssetsActions.upsertCharacter(projectId, {
      id: makeAssetId(),
      name: '新角色',
      details: '',
    }));
  };
  const handleAddScene = () => {
    commitAssetChange(() => projectAssetsActions.upsertScene(projectId, {
      id: makeAssetId(),
      name: '新场景',
      timeOfDay: '不定',
      prompt: '',
    }));
  };
  const handleAddProp = () => {
    commitAssetChange(() => projectAssetsActions.upsertProp(projectId, {
      id: makeAssetId(),
      name: '新道具',
      details: '',
    }));
  };

  return (
    <div className="sb-assets-grid">
      <div className="sb-assets-col">
        <div className="sb-assets-col-head">
          <span>角色 ({assets.keyCharacters.length})</span>
        </div>
        {assets.keyCharacters.map((c) => (
          <AssetCharacterCard
            key={c.id}
            character={c}
            onSave={(next) => commitAssetChange(() => projectAssetsActions.upsertCharacter(projectId, next))}
            onDelete={(id) => commitAssetChange(() => projectAssetsActions.removeCharacter(projectId, id))}
          />
        ))}
        <button type="button" className="sb-asset-add" onClick={handleAddCharacter}>+ 添加角色</button>
      </div>

      <div className="sb-assets-col">
        <div className="sb-assets-col-head">
          <span>场景 ({assets.sceneAnalysis.length})</span>
        </div>
        {assets.sceneAnalysis.map((s) => (
          <AssetSceneCard
            key={s.id}
            scene={s}
            onSave={(next) => commitAssetChange(() => projectAssetsActions.upsertScene(projectId, next))}
            onDelete={(id) => commitAssetChange(() => projectAssetsActions.removeScene(projectId, id))}
          />
        ))}
        <button type="button" className="sb-asset-add" onClick={handleAddScene}>+ 添加场景</button>
      </div>

      <div className="sb-assets-col">
        <div className="sb-assets-col-head">
          <span>道具 ({assets.keyProps.length})</span>
        </div>
        {assets.keyProps.map((p) => (
          <AssetPropCard
            key={p.id}
            prop={p}
            onSave={(next) => commitAssetChange(() => projectAssetsActions.upsertProp(projectId, next))}
            onDelete={(id) => commitAssetChange(() => projectAssetsActions.removeProp(projectId, id))}
          />
        ))}
        <button type="button" className="sb-asset-add" onClick={handleAddProp}>+ 添加道具</button>
      </div>
    </div>
  );
}
