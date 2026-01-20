# 🐛 Option DAX - Bug Report & Fix Plan

## Analisi completata: 20 Gennaio 2026
## Ultimo aggiornamento: 20 Gennaio 2026 (Round 2)

---

## ✅ BUG RISOLTI (Round 1)

### 1. **Calcolo P&L Realizzato Sbagliato nel Backend** ✅ FIXATO
### 2. **Pulsante "Riapri per Modificare" Non Funziona** ✅ FIXATO
### 3. **Share Mutation Usa `adminEmail` ma Backend Aspetta `adminId`** ✅ FIXATO
### 4. **realizedPnl è Stringa nel Database ma Numero nel Frontend** ✅ FIXATO
### 5. **OptionLeg optionType Case Mismatch** ✅ FIXATO
### 6. **Tipo `multiplier` Mismatch** ✅ FIXATO

---

## ✅ BUG RISOLTI (Round 2)

### 7. **Nuove Gambe Non Ricevono Modifiche** ✅ FIXATO
**File:** `client/src/components/StructureDetailView.tsx`
**Problema:** Quando si aggiunge una seconda gamba e si modifica quantity/strike/scadenza, i cambiamenti non venivano riflessi.
**Causa:** `handleLegChange` non creava deep copies delle legs, quindi React non rilevava i cambiamenti.
**Fix:** Riscritto `handleLegChange` per creare sempre nuovi oggetti per tutte le legs.

### 8. **Modifiche Non Riflesse su PayoffChart e Greche** ✅ FIXATO
**File:** `client/src/components/PayoffChart.tsx`
**Problema:** Il grafico non si aggiornava quando si modificavano le legs.
**Causa:** `useMemo` di `initialXDomain` aveva solo `legs.length` nelle dipendenze.
**Fix:** Aggiunto `legsKey` (JSON.stringify delle proprietà chiave) come dipendenza.

### 9. **Aggiornamento Solo on Blur, Non in Tempo Reale** ✅ FIXATO
**File:** `client/src/components/StructureDetailView.tsx`
**Problema:** Le modifiche ai campi numerici venivano applicate solo quando si usciva dal campo.
**Fix:** `handleNumericInputChange` ora aggiorna immediatamente la struttura ad ogni keystroke.

---

## 📋 FILE MODIFICATI (Round 2)

1. ✅ `client/src/components/StructureDetailView.tsx`
   - `handleLegChange` → deep copy di tutte le legs
   - `handleNumericInputChange` → aggiornamento immediato

2. ✅ `client/src/components/PayoffChart.tsx`
   - Aggiunto `legsKey` per forzare ricalcolo su ogni modifica

---

## 🔧 PROSSIMI PASSI

1. Testare l'app in ambiente di sviluppo
2. Verificare che i selettori (QuantitySelector, StrikeSelector, ExpiryDateSelector) aggiornino immediatamente
3. Verificare che PayoffChart si aggiorni in tempo reale
4. Testare il calcolo P&L con dati reali

