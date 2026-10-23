/* ============================================================
   Export PowerPoint du reporting Marges & ETP (PptxGenJS, dans le navigateur).
   Reprend la vue filtrée de marges.html : filtered, agg, dimRows, groups,
   comOf, scopeText, ETP_BASE, formats eur / keur / pctf / nf1 / nf2.
   ============================================================ */
(function () {
  const INK = '1A1A19', INK2 = '52514E', MUTED = '85837D', GRID = 'EBE9E4', CARD = 'F4F3F0', BORDER = 'E2E0DA',
        NAVY = '142469', ICE = 'DFE3F2', COST = '9B9B9B', MARGE = 'ED4018', NEG = 'B3261E', WHITE = 'FFFFFF';
  const FONT = 'Calibri', W = 13.333, MX = 0.6, CW = W - 2 * MX;
  const cut = (s, n) => (s = String(s ?? '')).length > n ? s.slice(0, n - 1) + '…' : s;
  const pct0 = (a, b) => b ? Math.round(a / b * 100) : 0;

  function title(s, text, sub) {
    s.addText(text, { x: MX, y: 0.4, w: CW, h: 0.7, fontFace: FONT, fontSize: 30, bold: true, color: INK, margin: 0, isTextBox: true });
    if (sub) s.addText(sub, { x: MX, y: 1.1, w: CW, h: 0.4, fontFace: FONT, fontSize: 15, color: INK2, margin: 0, isTextBox: true });
  }
  function statCard(s, x, y, w, h, value, label, sub, color) {
    s.addShape('roundRect', { x, y, w, h, fill: { color: CARD }, line: { color: CARD }, rectRadius: 0.12 });
    s.addText(value, { x: x + 0.25, y: y + 0.2, w: w - 0.5, h: 0.75, fontFace: FONT, fontSize: 34, bold: true, color: color || INK, margin: 0, valign: 'bottom', isTextBox: true });
    s.addText(label, { x: x + 0.25, y: y + 1.0, w: w - 0.5, h: 0.35, fontFace: FONT, fontSize: 14, color: INK2, margin: 0, isTextBox: true });
    if (sub) s.addText(sub, { x: x + 0.25, y: y + 1.35, w: w - 0.5, h: 0.32, fontFace: FONT, fontSize: 11, color: MUTED, margin: 0, isTextBox: true });
  }
  function table(s, head, body, opts) {
    const TH = { fill: { color: CARD }, bold: true, color: INK2, fontSize: 12 };
    const rows = [head.map(h => ({ text: h.text, options: Object.assign({}, TH, { align: h.align || 'left' }) }))]
      .concat(body.map((r, ri) => r.map((c, i) => ({ text: String(c.text ?? c), options: Object.assign({ align: head[i].align || 'left', color: INK, bold: !!head[i].bold || !!r.total }, c.options || {}) }))));
    s.addTable(rows, Object.assign({ fontFace: FONT, fontSize: 12, color: INK, valign: 'middle', border: { type: 'solid', pt: 0.5, color: BORDER }, margin: [3, 6, 3, 6], rowH: 0.36 }, opts));
  }
  // barres horizontales empilées : coût + marge = CA
  function caChart(s, list, x, y, w, h) {
    const labels = list.map(l => cut(l.label, 28));
    s.addChart('bar', [
      { name: 'Coût (total payé)', labels, values: list.map(l => Math.round(l.a.ca - Math.max(l.a.marge, 0))) },
      { name: 'Marge', labels, values: list.map(l => Math.round(l.a.marge)) },
    ], {
      x, y, w, h, barDir: 'bar', barGrouping: 'stacked', chartColors: [COST, MARGE], barGapWidthPct: 45,
      showLegend: true, legendPos: 't', legendFontFace: FONT, legendFontSize: 12, legendColor: INK2,
      catAxisLabelFontFace: FONT, catAxisLabelFontSize: 12, catAxisLabelColor: INK2, catAxisLineShow: false, catAxisOrientation: 'maxMin',
      valAxisLabelFontFace: FONT, valAxisLabelFontSize: 11, valAxisLabelColor: MUTED, valAxisLineShow: false, valAxisLabelFormatCode: '#,##0," k€"',
      valGridLine: { color: GRID, size: 0.75 }, catGridLine: { style: 'none' }, showValue: false,
    });
  }
  const numCell = (txt, neg) => ({ text: txt, options: neg ? { color: NEG } : {} });
  function dimSlide(pptx, opt) {
    const { rows, d, titleTxt, limit } = opt;
    let list = dimRows(rows, d).sort((p, q) => q.a.ca - p.a.ca);
    if (!list.length) return;
    const tot = agg(rows), all = list.length;
    if (limit && list.length > limit) list = list.slice(0, limit);
    const s = pptx.addSlide({ masterName: 'CONTENU' });
    const top = list[0], best = [...list].filter(x => x.a.ca > 0).sort((p, q) => q.a.taux - p.a.taux)[0];
    title(s, titleTxt + (limit && all > limit ? ` (${limit} premiers sur ${all})` : ''),
      `${top.label} : ${pct0(top.a.ca, tot.ca)} % du CA` + (best && list.length > 1 ? ` · meilleur taux de marge : ${best.label} (${pctf(best.a.taux)})` : ''));
    caChart(s, list, MX, 1.7, 5.6, Math.min(5.1, Math.max(2.6, 0.9 + list.length * 0.42)));
    const body = list.map(x => [cut(x.label, 26), nf1.format(x.a.etp), eur(x.a.ca), numCell(eur(x.a.marge), x.a.marge < 0), numCell(pctf(x.a.taux), x.a.taux < 0), isFinite(x.a.margeEtp) ? eur(x.a.margeEtp) : '–']);
    const t = d === 'groupe' ? agg(rows.filter(r => groups.some(g => g.members.includes(comOf(r))))) : tot;
    const totalRow = ['Total', nf1.format(t.etp), eur(t.ca), eur(t.marge), pctf(t.taux), isFinite(t.margeEtp) ? eur(t.margeEtp) : '–']; totalRow.total = true;
    body.push(totalRow);
    table(s, [{ text: DIMS[d].label, bold: true }, { text: 'ETP', align: 'right' }, { text: 'CA', align: 'right' }, { text: 'Marge', align: 'right', bold: true }, { text: 'Taux', align: 'right' }, { text: 'Marge/ETP', align: 'right' }],
      body, { x: 6.45, y: 1.85, w: CW - 5.85, colW: [1.95, 0.6, 1.0, 0.95, 0.75, 1.03], rowH: list.length > 10 ? 0.32 : 0.36, fontSize: list.length > 10 ? 11 : 12 });
  }

  async function build() {
    const rows = filtered();
    if (!rows.length) { const b = document.getElementById('pptxBtn'); b.textContent = 'Aucune donnée à exporter'; setTimeout(() => b.textContent = 'Exporter en présentation (.pptx)', 3000); return 'vide'; }
    const pptx = new PptxGenJS();
    pptx.layout = 'LAYOUT_WIDE';
    pptx.title = 'Marges et ETP';
    pptx.theme = { headFontFace: FONT, bodyFontFace: FONT };
    const per = scopeText();
    const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    pptx.defineSlideMaster({ title: 'CONTENU', background: { color: WHITE },
      objects: [{ text: { text: `Marges & ETP · ${per} · ETP = heures facturées / ${nf2.format(ETP_BASE)}`, options: { x: MX, y: 7.0, w: 11, h: 0.3, fontFace: FONT, fontSize: 10, color: MUTED, margin: 0 } } }],
      slideNumber: { x: W - MX - 0.6, y: 7.0, w: 0.6, h: 0.3, fontFace: FONT, fontSize: 10, color: MUTED, align: 'right' } });
    pptx.defineSlideMaster({ title: 'TITRE', background: { color: NAVY } });
    const a = agg(rows);

    /* 1. Titre */
    let s = pptx.addSlide({ masterName: 'TITRE' });
    s.addText('Marges & ETP', { x: MX, y: 1.6, w: CW, h: 1.0, fontFace: FONT, fontSize: 44, bold: true, color: WHITE, margin: 0, isTextBox: true });
    s.addText(per, { x: MX, y: 2.6, w: CW, h: 0.6, fontFace: FONT, fontSize: 22, color: ICE, margin: 0, isTextBox: true });
    s.addText(`Édité le ${today}`, { x: MX, y: 3.2, w: CW, h: 0.4, fontFace: FONT, fontSize: 14, color: ICE, margin: 0, isTextBox: true });
    [[eur(a.ca), 'CA facturé'], [eur(a.marge), `marge · ${pctf(a.taux)}`], [nf1.format(a.etp), 'ETP'], [isFinite(a.margeEtp) ? eur(a.margeEtp) : '–', 'marge par ETP']]
      .forEach(([v, l], i) => {
        const x = MX + i * 3.05;
        s.addText(v, { x, y: 4.7, w: 2.95, h: 0.9, fontFace: FONT, fontSize: 40, bold: true, color: WHITE, margin: 0, isTextBox: true });
        s.addText(l, { x, y: 5.6, w: 2.95, h: 0.4, fontFace: FONT, fontSize: 16, color: ICE, margin: 0, isTextBox: true });
      });

    /* 2. Chiffres clés */
    s = pptx.addSlide({ masterName: 'CONTENU' });
    title(s, 'Chiffres clés', `${eur(a.ca)} facturés pour ${eur(a.marge)} de marge, soit ${pctf(a.taux)} — ${nf1.format(a.etp)} ETP`);
    const cw = (CW - 2 * 0.35) / 3, chh = 2.0;
    [[eur(a.ca), 'CA facturé', `coût (total payé) ${eur(a.cout)}`, INK],
     [eur(a.marge), 'Marge', `${nf2.format(a.margeH || 0)} € par heure facturée`, a.marge < 0 ? NEG : MARGE],
     [pctf(a.taux), 'Taux de marge', isFinite(a.coeff) ? `coefficient moyen ${nf2.format(a.coeff)}` : '', INK],
     [nf1.format(a.etp), 'ETP', `${nf0.format(a.hf)} heures facturées / ${nf2.format(ETP_BASE)}`, INK],
     [isFinite(a.margeEtp) ? eur(a.margeEtp) : '–', 'Marge par ETP', isFinite(a.caEtp) ? `CA par ETP ${eur(a.caEtp)}` : '', INK],
     [`${nf0.format(a.interims)} / ${nf0.format(a.clients)}`, 'Intérimaires / clients', `${nf0.format(a.contrats)} contrats · ${nf0.format(a.dossiers)} dossier(s)`, INK]]
      .forEach(([v, l, sub, c], i) => statCard(s, MX + (i % 3) * (cw + 0.35), 1.85 + Math.floor(i / 3) * (chh + 0.35), cw, chh, v, l, sub, c));

    /* 3-6. Comparatifs */
    if (groups.length) dimSlide(pptx, { rows, d: 'groupe', titleTxt: 'Par agence' });
    dimSlide(pptx, { rows, d: 'dossier', titleTxt: 'Par dossier', limit: 12 });
    dimSlide(pptx, { rows, d: 'com', titleTxt: 'Par commercial', limit: 12 });
    dimSlide(pptx, { rows, d: 'client', titleTxt: 'Clients', limit: 10 });

    /* 7. Une fiche par agence */
    for (const g of groups) {
      const v = rows.filter(r => g.members.includes(comOf(r)));
      if (!v.length) continue;
      const ga = agg(v);
      s = pptx.addSlide({ masterName: 'CONTENU' });
      title(s, `Agence ${g.name}`, `${g.members.length} commercial(aux) · ${pct0(ga.ca, a.ca)} % du CA total`);
      [[eur(ga.ca), 'CA facturé', INK], [eur(ga.marge), `marge · ${pctf(ga.taux)}`, ga.marge < 0 ? NEG : MARGE], [nf1.format(ga.etp), 'ETP', INK], [isFinite(ga.margeEtp) ? eur(ga.margeEtp) : '–', 'marge par ETP', INK]]
        .forEach(([val, l, col], i) => {
          const x = MX + i * 3.05;
          s.addText(val, { x, y: 1.75, w: 2.9, h: 0.65, fontFace: FONT, fontSize: 30, bold: true, color: col, margin: 0, isTextBox: true });
          s.addText(l, { x, y: 2.4, w: 2.9, h: 0.35, fontFace: FONT, fontSize: 13, color: INK2, margin: 0, isTextBox: true });
        });
      const list = g.members.map(m => ({ label: m, a: agg(v.filter(r => comOf(r) === m)) })).filter(x => x.a.lignes).sort((p, q) => q.a.ca - p.a.ca);
      caChart(s, list, MX, 3.0, 5.6, Math.min(3.8, Math.max(2.2, 0.9 + list.length * 0.45)));
      const body = list.map(x => [cut(x.label, 26), nf1.format(x.a.etp), eur(x.a.ca), numCell(eur(x.a.marge), x.a.marge < 0), numCell(pctf(x.a.taux), x.a.taux < 0), isFinite(x.a.margeEtp) ? eur(x.a.margeEtp) : '–']);
      const tr = ['Total agence', nf1.format(ga.etp), eur(ga.ca), eur(ga.marge), pctf(ga.taux), isFinite(ga.margeEtp) ? eur(ga.margeEtp) : '–']; tr.total = true; body.push(tr);
      table(s, [{ text: 'Commercial', bold: true }, { text: 'ETP', align: 'right' }, { text: 'CA', align: 'right' }, { text: 'Marge', align: 'right', bold: true }, { text: 'Taux', align: 'right' }, { text: 'Marge/ETP', align: 'right' }],
        body, { x: 6.45, y: 3.1, w: CW - 5.85, colW: [1.95, 0.6, 1.0, 0.95, 0.75, 1.03] });
    }

    const part = F.groupe && groupById(F.groupe) ? '_' + groupById(F.groupe).name.replace(/[^\w-]+/g, '-') : '';
    const mois = F.mois ? '_' + F.mois : '';
    await pptx.writeFile({ fileName: `marges-etp${part}${mois}_${new Date().toISOString().slice(0, 10)}.pptx` });
  }

  window.exportMargesPptx = async function () {
    const btn = document.getElementById('pptxBtn'), label = btn.textContent;
    btn.disabled = true; btn.textContent = 'Génération…';
    let res; try { res = await build(); } catch (e) { console.error(e); btn.textContent = 'Erreur : ' + e.message; setTimeout(() => btn.textContent = label, 5000); btn.disabled = false; return; }
    btn.disabled = false; if (res !== 'vide') btn.textContent = label;
  };
})();
