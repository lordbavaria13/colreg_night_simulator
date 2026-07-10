# Projekt-Kontext für Claude Code

Dieses Repo (colreg_night_simulator) ist eines von Alex' Sailbyte-Projekten, einem Unternehmen für maritime App-Entwicklung. Es ist verknüpft mit Alex' Obsidian-Vault (github.com/lordbavaria13/obsidian-vault), seinem Zweiten Gehirn. Dort liegt unter anderem die zugehörige Projekt-Notiz mit Ziel, Features und technischer Doku, und dort läuft täglich eine automatisierte Morgen-Routine, die unter anderem dieses Repo ausliest (Issues, Commits, und dieses Session-Log), um Alex einen priorisierten Tagesplan zu erstellen.

## Regel: Session-Log führen

Führe am Ende jeder Arbeitssession in diesem Repo (egal ob über das VS Code Plugin oder eine Remote-Control-Session auf dem Entwicklungsserver) einen kurzen Eintrag in `Session-Log.md` im Repo-Root. Frag am Ende einer Session kurz nach ob ein Eintrag geschrieben werden soll, falls es nicht offensichtlich ist.

Der Eintrag soll enthalten:
- Datum
- Was wurde gebaut oder geändert (Features, Fixes)
- Welche Probleme sind aufgetreten, und wie wurden sie gelöst bzw. was ist noch offen
- Offene nächste Schritte

Format für einen neuen Eintrag (neueste Einträge immer oben anfügen, nicht unten):

```
## YYYY-MM-DD
**Gebaut:** ...
**Probleme:** ...
**Nächste Schritte:** ...
```

Committe und pushe den Session-Log-Eintrag zusammen mit den restlichen Änderungen der Session, wenn Alex das möchte.

## Kontext-Speicher: Obsidian Vault

Alex' Obsidian-Vault (github.com/lordbavaria13/obsidian-vault, privates Repo) ist sein Zweites Gehirn und der zentrale Kontext-Speicher für alles Sailbyte-Bezogene. Wenn du in diesem Repo arbeitest und übergeordneten Kontext brauchst, zum Beispiel Alex' Hintergrund, Zielgruppe, Angebot, Schreibstil und Tonalität, oder das große Ziel und die geplanten Features dieses Projekts, hol dir die relevanten Infos von dort statt zu raten:

- `00 Kontext/Über mich.md`, `ICP.md`, `Angebot.md`, `Schreibstil.md`, `Branding.md` – persönliches Profil, Zielgruppe, Angebot, Schreibstil, Branding
- `02 Projekte/COLREG Night Simulator.md` – die zu diesem Repo gehörende Projekt-Notiz mit Ziel, Features und technischer Umsetzung
- `03 Bereiche/Persönlichkeitsentwicklung/Ideenjournal.md` – lose Ideen, die eventuell relevant für dieses Projekt sein könnten

Falls das Vault-Repo lokal noch nicht verfügbar ist, klone es read-only mit `git clone https://github.com/lordbavaria13/obsidian-vault`, um die Dateien zu lesen. Nimm dort keine Änderungen vor, außer Alex bittet dich explizit die Projekt-Doku dort zu aktualisieren.
