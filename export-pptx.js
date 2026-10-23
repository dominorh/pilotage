/* ============================================================
   Export PowerPoint (.pptx) — généré entièrement dans le navigateur
   avec PptxGenJS. Reprend la vue filtrée affichée à l'écran.
   Dépend des fonctions de index.html : filtered, groupBy, sum, sumType,
   distinct, uniq, topOf, comStats, weekLabel, weekMonday, F, datasets.
   ============================================================ */
(function () {
  const INK = '1A1A19', INK2 = '52514E', MUTED = '85837D', GRID = 'EBE9E4',
        CARD = 'F4F3F0', BORDER = 'E2E0DA', NAVY = '142469', ICE = 'DFE3F2',
        CAND = '142469', CLI = 'ED4018', WHITE = 'FFFFFF';
  const FONT = 'Calibri';
  const W = 13.333, MX = 0.6, CW = W - 2 * MX;   // largeur utile

  const fmtN = n => Number(n).toLocaleString('fr-FR');
  const pct = (a, b) => b ? Math.round(a / b * 100) : 0;
  const cut = (s, n) => (s = String(s ?? '')).length > n ? s.slice(0, n - 1) + '…' : s;

  function perimetre() {
    const p = [];
    if (F.week) p.push(weekLabel(F.week, true));
    else {
      const ws = uniq(filtered(), 'semaine');
      if (ws.length === 1) p.push(weekLabel(ws[0], true));
      else if (ws.length > 1) p.push(`${weekLabel(ws[0])} à ${weekLabel(ws[ws.length - 1])} ${ws[ws.length - 1].slice(0, 4)}`);
    }
    if (F.agence) p.push('Agence ' + F.agence);
    if (F.com) p.push(F.com);
    if (F.type) p.push(F.type + 's');
    if (F.action) p.push(F.action);
    if (F.year && !F.week) p.push('Année ' + F.year);
    return p.join(' · ') || 'Toutes les données';
  }

  // options communes des graphiques (barres empilées Candidat / Client)
  function chartOpts(o) {
    const horiz = o.barDir === 'bar';
    return Object.assign({
      barGrouping: 'stacked', chartColors: [CAND, CLI], barGapWidthPct: 45,
      showLegend: true, legendPos: 't', legendFontFace: FONT, legendFontSize: 12, legendColor: INK2,
      catAxisLabelFontFace: FONT, catAxisLabelFontSize: 12, catAxisLabelColor: INK2,
      catAxisLineShow: false, catAxisOrientation: horiz ? 'maxMin' : 'minMax',
      valAxisLabelFontFace: FONT, valAxisLabelFontSize: 11, valAxisLabelColor: MUTED, valAxisLineShow: false, valAxisMinVal: 0,
      valGridLine: { color: GRID, size: 0.75 }, catGridLine: { style: 'none' },
      showValue: true, dataLabelPosition: 'ctr', dataLabelFontFace: FONT, dataLabelFontSize: 11,
      dataLabelColor: WHITE, dataLabelFormatCode: '#,##0;;',
    }, o);
  }
  const series = (groups) => [
    { name: 'Candidat', labels: groups.map(g => g.label), values: groups.map(g => g.c) },
    { name: 'Client',   labels: groups.map(g => g.label), values: groups.map(g => g.l) },
  ];
  function addBar(slide, groups, o) {
    const max = Math.max(1, ...groups.map(g => g.t));
    if (max <= 12) o.valAxisMajorUnit = 1;               // pas de graduations à 0,5
    slide.addChart('bar', series(groups), chartOpts(o));
  }
  function topGroups(rows, key, n, labelFn) {
    let g = [...groupBy(rows, key)].map(([k, v]) => ({ k, label: labelFn ? labelFn(k) : k, t: sum(v), c: sumType(v, 'Candidat'), l: sumType(v, 'Client') }))
      .sort((a, b) => b.t - a.t);
    if (n && g.length > n) {
      const rest = g.slice(n - 1);
      g = g.slice(0, n - 1).concat([{ k: 'autres', label: `Autres (${rest.length})`, t: sum(rest.map(x => ({ n: x.t }))),
        c: rest.reduce((s, x) => s + x.c, 0), l: rest.reduce((s, x) => s + x.l, 0) }]);
    }
    return g;
  }

  function title(slide, text, sub) {
    slide.addText(text, { x: MX, y: 0.4, w: CW, h: 0.7, fontFace: FONT, fontSize: 30, bold: true, color: INK, margin: 0, isTextBox: true });
    if (sub) slide.addText(sub, { x: MX, y: 1.1, w: CW, h: 0.4, fontFace: FONT, fontSize: 15, color: INK2, margin: 0, isTextBox: true });
  }
  const TH = { fill: { color: CARD }, bold: true, color: INK2, fontSize: 12 };
  function table(slide, head, body, opts) {
    const rows = [head.map(h => ({ text: h.text, options: Object.assign({}, TH, { align: h.align || 'left' }) }))]
      .concat(body.map(r => r.map((c, i) => ({ text: String(c), options: { align: head[i].align || 'left', bold: !!head[i].bold, color: INK } }))));
    slide.addTable(rows, Object.assign({ fontFace: FONT, fontSize: 12, color: INK, valign: 'middle',
      border: { type: 'solid', pt: 0.5, color: BORDER }, margin: [3, 6, 3, 6], rowH: 0.34 }, opts));
  }
  function statCard(slide, x, y, w, h, value, label, color) {
    slide.addShape('roundRect', { x, y, w, h, fill: { color: CARD }, line: { color: CARD }, rectRadius: 0.12 });
    slide.addText(value, { x: x + 0.25, y: y + 0.18, w: w - 0.5, h: h * 0.52, fontFace: FONT, fontSize: 40, bold: true, color: color || INK, margin: 0, valign: 'bottom', isTextBox: true });
    slide.addText(label, { x: x + 0.25, y: y + 0.2 + h * 0.52, w: w - 0.5, h: h * 0.3, fontFace: FONT, fontSize: 14, color: INK2, margin: 0, valign: 'top', isTextBox: true });
  }

  async function exportPptx() {
    const rows = filtered();
    if (!rows.length) { alert('Aucune donnée à exporter avec les filtres actuels.'); return; }
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE';
    pptx.title = 'Statistiques commerciales';
    pptx.subject = perimetre();
    pptx.theme = { headFontFace: FONT, bodyFontFace: FONT };
    const per = perimetre();
    const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

    pptx.defineSlideMaster({ title: 'CONTENU', background: { color: WHITE },
      objects: [{ text: { text: `Statistiques commerciales · ${per}`, options: { x: MX, y: 7.0, w: 10, h: 0.3, fontFace: FONT, fontSize: 10, color: MUTED, margin: 0 } } }],
      slideNumber: { x: W - MX - 0.6, y: 7.0, w: 0.6, h: 0.3, fontFace: FONT, fontSize: 10, color: MUTED, align: 'right' } });
    pptx.defineSlideMaster({ title: 'TITRE', background: { color: NAVY } });

    const tot = sum(rows), cand = sumType(rows, 'Candidat'), cli = sumType(rows, 'Client');
    const candD = distinct(rows.filter(r => r.type === 'Candidat'), r => r.cible);
    const cliD = distinct(rows.filter(r => r.type === 'Client'), r => r.cible);
    const nCom = distinct(rows, r => r.commercial), nAg = distinct(rows, r => r.agence);

    /* 1. Titre */
    let s = pptx.addSlide({ masterName: 'TITRE' });
    s.addText('Statistiques commerciales', { x: MX, y: 1.6, w: CW, h: 1.0, fontFace: FONT, fontSize: 44, bold: true, color: WHITE, margin: 0, isTextBox: true });
    s.addText(per, { x: MX, y: 2.6, w: CW, h: 0.6, fontFace: FONT, fontSize: 22, color: ICE, margin: 0, isTextBox: true });
    s.addText(`Édité le ${today}`, { x: MX, y: 3.2, w: CW, h: 0.4, fontFace: FONT, fontSize: 14, color: ICE, margin: 0, isTextBox: true });
    [[fmtN(tot), 'actions'], [fmtN(candD), 'candidats suivis'], [fmtN(cliD), 'clients contactés'], [fmtN(nCom), nCom > 1 ? 'commerciaux' : 'commercial']]
      .forEach(([v, l], i) => {
        const x = MX + i * 3.05;
        s.addText(v, { x, y: 4.7, w: 2.9, h: 0.9, fontFace: FONT, fontSize: 48, bold: true, color: WHITE, margin: 0, isTextBox: true });
        s.addText(l, { x, y: 5.6, w: 2.9, h: 0.4, fontFace: FONT, fontSize: 16, color: ICE, margin: 0, isTextBox: true });
      });

    /* 2. Chiffres clés */
    s = pptx.addSlide({ masterName: 'CONTENU' });
    const pc = pct(cand, tot), pk = cand + cli === tot ? 100 - pc : pct(cli, tot);
    title(s, 'Chiffres clés', `${fmtN(tot)} actions, dont ${pc} % auprès des candidats et ${pk} % auprès des clients`);
    const cw = (CW - 2 * 0.35) / 3, chh = 2.15;
    [[fmtN(tot), 'Actions au total', INK], [fmtN(cand), 'Actions candidats', CAND], [fmtN(cli), 'Actions clients', CLI],
     [fmtN(candD), 'Candidats distincts', INK], [fmtN(cliD), 'Clients distincts', INK], [`${fmtN(nCom)} / ${fmtN(nAg)}`, 'Commerciaux / agences actifs', INK]]
      .forEach(([v, l, c], i) => statCard(s, MX + (i % 3) * (cw + 0.35), 1.85 + Math.floor(i / 3) * (chh + 0.35), cw, chh, v, l, c));

    /* 3. Par agence */
    const ags = topGroups(rows, 'agence', 10);
    if (ags.length > 1) {
    s = pptx.addSlide({ masterName: 'CONTENU' });
    const ag1 = ags[0];
    title(s, 'Activité par agence', ags.length > 1 ? `${ag1.label} réalise ${pct(ag1.t, tot)} % des actions` : `${ag1.label} : ${fmtN(ag1.t)} actions`);
    addBar(s, ags, { barDir: 'bar', x: MX, y: 1.7, w: 5.6, h: Math.min(5.0, Math.max(3.4, 1.1 + ags.length * 0.7)) });
    const agRows = [...groupBy(rows, 'agence')].map(([a, v]) => [a, sum(v), sumType(v, 'Candidat'), sumType(v, 'Client'),
      distinct(v.filter(r => r.type === 'Candidat'), r => r.cible), distinct(v.filter(r => r.type === 'Client'), r => r.cible),
      distinct(v, r => r.commercial), cut(topOf(v, 'action')[0], 26)]).sort((a, b) => b[1] - a[1]).slice(0, 12);
    table(s, [{ text: 'Agence', bold: true }, { text: 'Actions', align: 'right', bold: true }, { text: 'Cand.', align: 'right' }, { text: 'Clients', align: 'right' },
      { text: 'Cand. dist.', align: 'right' }, { text: 'Cli. dist.', align: 'right' }, { text: 'Comm.', align: 'right' }, { text: 'Action n°1' }],
      agRows.map(r => r.map((c, i) => i > 0 && i < 7 ? fmtN(c) : c)),
      { x: 6.5, y: 1.85, w: CW - 5.9, colW: [0.9, 0.75, 0.6, 0.65, 0.75, 0.65, 0.75, 1.18] });
    }

    /* 4. Évolution par semaine */
    const wks = [...groupBy(rows, 'semaine')].map(([k, v]) => ({ k, label: weekLabel(k), t: sum(v), c: sumType(v, 'Candidat'), l: sumType(v, 'Client') }))
      .sort((a, b) => a.k.localeCompare(b.k));
    if (wks.length > 1) {
      s = pptx.addSlide({ masterName: 'CONTENU' });
      const best = wks.reduce((a, b) => b.t > a.t ? b : a);
      const last = wks[wks.length - 1], prev = wks[wks.length - 2];
      const evo = prev.t ? Math.round((last.t - prev.t) / prev.t * 100) : 0;
      title(s, 'Évolution par semaine', `Meilleure semaine : ${weekLabel(best.k, true)} (${fmtN(best.t)} actions) · dernière semaine : ${evo >= 0 ? '+' : ''}${evo} % vs la précédente`);
      addBar(s, wks, { barDir: 'col', x: MX, y: 1.7, w: CW, h: 5.0, barGapWidthPct: wks.length < 6 ? 120 : 50 });
    }

    /* 5. Par commercial */
    const coms = topGroups(rows, 'commercial', 12);
    s = pptx.addSlide({ masterName: 'CONTENU' });
    title(s, 'Activité par commercial', `${coms[0].label} est le plus actif avec ${fmtN(coms[0].t)} actions (${pct(coms[0].t, tot)} %)`);
    addBar(s, coms, { barDir: 'bar', x: MX, y: 1.7, w: 6.0, h: Math.min(5.1, Math.max(3.6, 1.0 + coms.length * 0.45)) });
    const cs = comStats(rows).sort((a, b) => b.total - a.total).slice(0, 12);
    table(s, [{ text: 'Commercial', bold: true }, { text: 'Agence' }, { text: 'Actions', align: 'right', bold: true }, { text: 'Part', align: 'right' },
      { text: 'Cand.', align: 'right' }, { text: 'Clients', align: 'right' }, { text: 'Cibles', align: 'right' }],
      cs.map(d => [cut(d.commercial, 24), cut(d.agence, 10), fmtN(d.total), pct(d.total, tot) + ' %', fmtN(d.cand), fmtN(d.cli), fmtN(d.candD + d.cliD)]),
      { x: 6.9, y: 1.85, w: CW - 6.3, colW: [1.85, 0.75, 0.75, 0.6, 0.6, 0.7, 0.58] });

    /* 6. Types d'action */
    const acts = topGroups(rows, 'action', 12);
    s = pptx.addSlide({ masterName: 'CONTENU' });
    title(s, 'Actions par type', `${acts[0].label} arrive en tête avec ${fmtN(acts[0].t)} actions (${pct(acts[0].t, tot)} %)`);
    addBar(s, acts, { barDir: 'bar', x: MX, y: 1.7, w: CW, h: Math.min(5.1, 1.0 + acts.length * 0.38), catAxisLabelFontSize: 12 });

    /* 7. Une fiche par commercial */
    pptx.addSection({ title: 'Détail par commercial' });
    for (const c of comStats(rows).sort((a, b) => b.total - a.total)) {
      const v = rows.filter(r => r.commercial === c.commercial);
      s = pptx.addSlide({ masterName: 'CONTENU', sectionTitle: 'Détail par commercial' });
      title(s, c.commercial, `${c.agence} · ${fmtN(c.total)} actions (${pct(c.total, tot)} % du total) · ${fmtN(c.candD + c.cliD)} cibles distinctes`);
      [[fmtN(c.cand), 'actions candidats', CAND], [fmtN(c.cli), 'actions clients', CLI], [fmtN(c.nbAct), "types d'action", INK]]
        .forEach(([val, l, col], i) => {
          const x = MX + i * 1.95;
          s.addText(val, { x, y: 1.75, w: 1.8, h: 0.6, fontFace: FONT, fontSize: 30, bold: true, color: col, margin: 0, isTextBox: true });
          s.addText(l, { x, y: 2.35, w: 1.8, h: 0.35, fontFace: FONT, fontSize: 12, color: INK2, margin: 0, isTextBox: true });
        });
      const ca = topGroups(v, 'action', 9);
      addBar(s, ca, { barDir: 'bar', x: MX, y: 2.9, w: 5.8, h: Math.min(3.9, 0.9 + ca.length * 0.36), catAxisLabelFontSize: 11, legendFontSize: 11 });
      const cib = [...groupBy(v, r => r.type + '|' + r.cible)].map(([, x]) => ({ type: x[0].type, cible: x[0].cible, t: sum(x),
        acts: [...groupBy(x, 'action')].sort((a, b) => sum(b[1]) - sum(a[1])).map(([a]) => a.replace(/^[A-Z]{1,2} - /, '')).join(', ') }))
        .sort((a, b) => b.t - a.t || a.cible.localeCompare(b.cible, 'fr'));
      s.addText(`Cibles les plus suivies${cib.length > 8 ? ` (8 sur ${cib.length})` : ''}`, { x: 6.8, y: 1.75, w: CW - 6.2, h: 0.35, fontFace: FONT, fontSize: 14, bold: true, color: INK, margin: 0, isTextBox: true });
      table(s, [{ text: 'Cible' }, { text: 'Type' }, { text: 'Actions', align: 'right', bold: true }, { text: 'Détail' }],
        cib.slice(0, 8).map(x => [cut(x.cible, 30), x.type, fmtN(x.t), cut(x.acts, 52)]),
        { x: 6.8, y: 2.2, w: CW - 6.2, colW: [2.05, 0.8, 0.7, 2.38], fontSize: 11, rowH: 0.42 });
    }

    const wkPart = F.week ? '_' + weekLabel(F.week) + '-' + F.week.slice(0, 4) : '';
    const agPart = F.agence ? '_' + F.agence.replace(/[^\w-]+/g, '-') : '';
    await pptx.writeFile({ fileName: `statistiques-commerciales${agPart}${wkPart}_${new Date().toISOString().slice(0, 10)}.pptx` });
  }

  window.exportPptx = async function () {
    const btn = document.getElementById('pptxBtn');
    const label = btn.textContent;
    btn.disabled = true; btn.textContent = 'Génération…';
    try { await exportPptx(); }
    catch (e) { console.error(e); alert('Impossible de générer la présentation : ' + e.message); }
    finally { btn.disabled = false; btn.textContent = label; }
  };
})();
