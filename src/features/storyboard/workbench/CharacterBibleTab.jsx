import React from 'react';
import { storyboardPackageActions } from '../../../shared/store/storyboardPackageStore.js';
import {
  normalizeAnalysisDraft,
  patchAnalysisDraft,
  promoteCandidateCharacter,
  refreshReferenceDiagnostics,
} from '../reference/referencePackage.js';
import { asArray, displayFirst, displayKey } from './displayValue.js';

const characterName = (character, index) => (
  displayFirst([
    character?.name,
    character?.title,
    character?.id,
  ], `角色 ${index + 1}`)
);

const characterIdentity = (character) => (
  displayFirst([
    character?.identity,
    character?.confirmation,
    character?.role,
    character?.description,
  ], '待确认')
);

const warningMessage = (warning, index) => (
  displayFirst([
    warning?.message,
    warning?.text,
    warning?.title,
  ], `冲突 ${index + 1}`)
);

const candidateName = (candidate, index) => (
  displayFirst([
    candidate?.name,
    candidate?.title,
    candidate?.id,
  ], `候选角色 ${index + 1}`)
);

const candidateDetails = (candidate) => (
  displayFirst([
    candidate?.details,
    candidate?.source,
    candidate?.notes,
    candidate?.confirmationStatus,
  ], '待确认')
);

const domKey = (value, fallback) => (
  displayFirst([value], fallback)
    .replace(/[^\w\u4e00-\u9fa5-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    || fallback
);

export function CharacterBibleTab({ nodeId, projectId, storyboardPackage }) {
  const characterBible = storyboardPackage?.characterBible || {};
  const characters = asArray(characterBible.characters);
  const conflictReport = asArray(characterBible.conflictReport);
  const candidates = asArray(storyboardPackage?.analysisDraft?.referenceAnalysis?.characterCandidates);

  const updatePackage = React.useCallback((updater) => {
    if (!nodeId) return;
    storyboardPackageActions.updateNodePackage(nodeId, { projectId, updater });
  }, [nodeId, projectId]);

  const confirmCandidate = React.useCallback((candidateId) => {
    updatePackage((pkg) => refreshReferenceDiagnostics(promoteCandidateCharacter(pkg, candidateId)));
  }, [updatePackage]);

  const rejectCandidate = React.useCallback((candidateId) => {
    updatePackage((pkg) => {
      const draft = normalizeAnalysisDraft(pkg?.analysisDraft);
      return refreshReferenceDiagnostics(patchAnalysisDraft(pkg, {
        referenceAnalysis: {
          ...draft.referenceAnalysis,
          characterCandidates: draft.referenceAnalysis.characterCandidates.map((candidate) => (
            candidate.id === candidateId
              ? { ...candidate, confirmationStatus: 'rejected' }
            : candidate
          )),
        },
      }));
    });
  }, [updatePackage]);

  return (
    <section className="sb-package-panel">
      <div className="sb-package-head">
        <div>
          <h2>角色设定</h2>
          <p>角色 {characters.length}</p>
        </div>
        <span className="sb-status-pill">角色 {characters.length}</span>
      </div>

      {characters.length === 0 ? (
        <div className="sb-empty-block">还没有角色设定。</div>
      ) : (
        <div className="sb-package-list">
          {characters.map((character, index) => (
            <div
              className="sb-package-row"
              key={displayKey([character?.id, character?.name], `character-${index}`)}
            >
              <strong>{characterName(character, index)}</strong>
              <span>{characterIdentity(character)}</span>
            </div>
          ))}
        </div>
      )}

      {conflictReport.length > 0 && (
        <ul className="sb-warning-list">
          {conflictReport.map((warning, index) => (
            <li key={displayKey([warning?.id, warning?.message], `conflict-${index}`)}>
              {warningMessage(warning, index)}
            </li>
          ))}
        </ul>
      )}

      {candidates.length > 0 && (
        <>
          <div className="sb-package-head compact">
            <div>
              <h2>AI 候选角色</h2>
              <p>候选 {candidates.length}</p>
            </div>
            <span className="sb-status-pill">需确认</span>
          </div>
          <div className="sb-package-list">
            {candidates.map((candidate, index) => {
              const key = domKey(candidate?.id, `candidate-${index}`);
              const status = displayFirst([candidate?.confirmationStatus], 'candidate');
              const canReview = status === 'candidate';
              return (
                <div className="sb-package-row sb-candidate-row" key={displayKey([candidate?.id, candidate?.name], `candidate-${index}`)}>
                  <div className="sb-reference-main">
                    <strong>{candidateName(candidate, index)}</strong>
                    <span>{candidateDetails(candidate)}</span>
                  </div>
                  <span>{status}</span>
                  <div className="sb-package-actions inline">
                    <button
                      type="button"
                      data-testid={`confirm-candidate-${key}`}
                      disabled={!canReview}
                      onClick={() => confirmCandidate(candidate.id)}
                    >
                      确认
                    </button>
                    <button
                      type="button"
                      data-testid={`reject-candidate-${key}`}
                      disabled={!canReview}
                      onClick={() => rejectCandidate(candidate.id)}
                    >
                      驳回
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
