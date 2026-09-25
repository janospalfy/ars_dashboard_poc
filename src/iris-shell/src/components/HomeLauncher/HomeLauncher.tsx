import { useEffect, useMemo, useRef, useState } from 'react';
import { BorderBeam } from 'border-beam';
import { cx } from '../../lib/cx.js';
import { navigate } from '../../lib/router.js';
import { useAppShell } from '../../lib/appShellContext.js';
import { filterItems, type CommandItem } from '../../lib/commands.js';
import { Icon } from '../Icon/Icon.js';
import { ComposerButton } from '../AiPanel/AiPanel.js';
import styles from './HomeLauncher.module.css';

export interface HomeLauncherProps {
  /** Jump-to destinations searched as the user types. */
  commandItems: CommandItem[];
  /** Full placeholder text, e.g. "Search or ask Active Roles AI anything". */
  placeholder: string;
  /** Short AI name used inline, e.g. "Active Roles AI". */
  aiName: string;
}

/**
 * HomeLauncher — the Home hero search/ask bar. A real input with a muted
 * border that reveals a gradient border-beam on focus (like the AI composer),
 * plus an inline options panel (search matches + Ask AI) instead of opening
 * the ⌘K modal.
 */
export function HomeLauncher({ commandItems, placeholder, aiName }: HomeLauncherProps) {
  const { setAiOpen, setPendingAiPrompt } = useAppShell();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const blurTimer = useRef<number | null>(null);

  const q = query.trim();
  const matches = useMemo(
    () => (q ? filterItems(commandItems, q).slice(0, 5) : commandItems.slice(0, 5)),
    [q, commandItems],
  );

  // Clear any pending blur-close timer if the launcher unmounts (e.g. on nav).
  useEffect(
    () => () => {
      if (blurTimer.current) window.clearTimeout(blurTimer.current);
    },
    [],
  );

  const close = () => {
    setFocused(false);
    setQuery('');
  };

  const askAi = () => {
    setPendingAiPrompt(q || 'What can you help me with?');
    setAiOpen(true);
    close();
  };

  const goTo = (hash?: string) => {
    if (hash) navigate(hash);
    close();
  };

  const onFocus = () => {
    if (blurTimer.current) window.clearTimeout(blurTimer.current);
    setFocused(true);
  };
  // Delay close so a click on an option registers before the panel unmounts.
  const onBlur = () => {
    blurTimer.current = window.setTimeout(() => setFocused(false), 140);
  };

  return (
    <div className={styles.wrap}>
      <BorderBeam
        size="pulse-outside"
        colorVariant="colorful"
        strength={0.7}
        active={focused}
        className={styles.beam}
      >
        <div className={cx(styles.field, focused && styles.fieldFocused)}>
          <Icon name="MagnifyingGlass" size="18px" className={styles.leadIcon} />
          <input
            className={styles.input}
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                askAi();
              } else if (e.key === 'Escape') {
                close();
              }
            }}
          />
          <ComposerButton
            state="voice"
            ariaLabel="Voice input"
            onMouseDown={(e) => e.preventDefault()}
          />
        </div>
      </BorderBeam>

      {focused && (
        <div className={styles.panel} role="listbox">
          <button type="button" className={styles.option} onClick={askAi}>
            <Icon name="Sparkle" size="16px" className={styles.optIcon} />
            <span className={styles.optLabel}>
              {q ? `Ask ${aiName} about “${q}”` : `Ask ${aiName} anything`}
            </span>
          </button>

          {matches.length > 0 && (
            <>
              <div className={styles.sectionLabel}>{q ? 'Jump to' : 'Suggestions'}</div>
              {matches.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={styles.option}
                  onClick={() => goTo(m.hash)}
                >
                  <Icon name={m.icon} size="16px" className={styles.optIcon} />
                  <span className={styles.optLabel}>{m.label}</span>
                  {m.secondary && <span className={styles.optMeta}>{m.secondary}</span>}
                </button>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
