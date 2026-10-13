(() => {
  const data = window.SU_DATA;
  const $ = id => document.getElementById(id);
  const dialog = $("detailDialog");
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const safeUrl = url => /^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(url || "") ? url : "#";
  $("year").textContent = new Date().getFullYear();

  const uniGrid = $("universityGrid");
  const scholarshipList = $("scholarshipList");
  const updateGrid = $("updatesGrid");

  const cities = [...new Set(data.universities.map(u => u.city))].sort();
  cities.forEach(city => { const o = document.createElement("option"); o.value = city; o.textContent = city; $("cityFilter").appendChild(o); });

  function renderUniversities() {
    const q = $("universitySearch").value.trim().toLowerCase(), city = $("cityFilter").value, type = $("typeFilter").value;
    const rows = data.universities.filter(u => (!q || [u.name,u.city,...u.areas].join(" ").toLowerCase().includes(q)) && (!city || u.city === city) && (!type || u.type === type));
    uniGrid.innerHTML = rows.map((u,i) => `<article class="university-card"><div class="uni-art" style="background:linear-gradient(135deg,${["#1b466a,#7b9c85","#314d78,#b5a37b","#194d56,#92b5a2","#455477,#a6b5cb"][i%4]})"><span class="uni-symbol">${esc(u.symbol)}</span><span class="uni-type">${esc(u.type)}</span></div><div class="uni-body"><h3>${esc(u.name)}</h3><span class="uni-city">⌖ ${esc(u.city)}, Pakistan</span><p>${esc(u.description)}</p><div class="tag-row">${u.areas.slice(0,3).map(a=>`<span class="tag">${esc(a)}</span>`).join("")}</div><button data-uni="${esc(u.name)}">View overview ↗</button></div></article>`).join("");
    $("universityEmpty").classList.toggle("hidden", rows.length > 0);
    uniGrid.querySelectorAll("[data-uni]").forEach(b => b.addEventListener("click", () => {
      const u = data.universities.find(x => x.name === b.dataset.uni);
      openDialog(`<span class="kicker">UNIVERSITY OVERVIEW</span><h2>${esc(u.name)}</h2><div class="dialog-meta"><span class="tag">${esc(u.city)}</span><span class="tag">${esc(u.type)}</span>${u.areas.map(a=>`<span class="tag">${esc(a)}</span>`).join("")}</div><p>${esc(u.description)}</p><h3>Before applying</h3><ul><li>Confirm the program is offered at your intended campus.</li><li>Check the latest eligibility, fee, test and deadline information.</li><li>Use the institution's official admissions portal.</li></ul><a class="dialog-link" href="${safeUrl(u.url)}" target="_blank" rel="noopener noreferrer">Visit official website ↗</a>`);
    }));
  }

  function renderScholarships() {
    const q = $("scholarshipSearch").value.trim().toLowerCase(), level = $("levelFilter").value, funding = $("fundingFilter").value;
    const rows = data.scholarships.filter(s => (!q || [s.name,s.provider,s.summary,...s.tags].join(" ").toLowerCase().includes(q)) && (!level || s.level === level) && (!funding || s.funding === funding));
    scholarshipList.innerHTML = rows.map((s,i) => `<article class="scholarship-card"><div class="scholarship-icon">${["✳","◎","★","⌂","▤","✦"][i%6]}</div><div><h3>${esc(s.name)}</h3><p>${esc(s.provider)} · ${esc(s.level)}</p><p>${esc(s.summary)}</p><div class="tag-row"><span class="tag">${esc(s.funding)}</span>${s.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join("")}</div></div><button class="outline-button" data-scholarship="${esc(s.name)}">View details ↗</button></article>`).join("");
    $("scholarshipEmpty").classList.toggle("hidden", rows.length > 0);
    scholarshipList.querySelectorAll("[data-scholarship]").forEach(b => b.addEventListener("click", () => {
      const s = data.scholarships.find(x => x.name === b.dataset.scholarship);
      openDialog(`<span class="kicker">FUNDING INFORMATION</span><h2>${esc(s.name)}</h2><div class="dialog-meta"><span class="tag">${esc(s.level)}</span><span class="tag">${esc(s.funding)}</span></div><p>${esc(s.summary)}</p><p><b>Provider:</b> ${esc(s.provider)}</p><h3>What to check</h3><ul><li>Whether a current application call is open.</li><li>Nationality, academic, income and degree-level eligibility.</li><li>Coverage, renewal conditions and the official deadline.</li><li>Required documents and the official submission method.</li></ul><a class="dialog-link" href="${safeUrl(s.url)}" target="_blank" rel="noopener noreferrer">Check official source ↗</a>`);
    }));
  }

  function renderUpdates() {
    updateGrid.innerHTML = data.updates.map(u => `<article class="update-card"><span class="update-date">${esc(u.label)}</span><h3>${esc(u.title)}</h3><p>${esc(u.summary)}</p><a href="${safeUrl(u.url)}" target="_blank" rel="noopener noreferrer">Check official source ↗</a></article>`).join("");
  }
  function openDialog(html) { $("dialogContent").innerHTML = html; dialog.showModal(); }
  $("dialogClose").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", e => { if(e.target === dialog) dialog.close(); });

  document.querySelectorAll(".guide-open").forEach(b => b.addEventListener("click", () => {
    const g = data.guides[b.dataset.guide];
    openDialog(`<span class="kicker">STUDENTS URAN GUIDE</span><h2>${esc(g.title)}</h2><p>${esc(g.intro)}</p><ol>${g.steps.map(s=>`<li>${esc(s)}</li>`).join("")}</ol><p><b>Tip:</b> Requirements vary. Always follow the current official instructions for your institution or scholarship.</p>`);
  }));

  ["universitySearch","cityFilter","typeFilter"].forEach(id => $(id).addEventListener(id.endsWith("Search") ? "input" : "change", renderUniversities));
  ["scholarshipSearch","levelFilter","fundingFilter"].forEach(id => $(id).addEventListener(id.endsWith("Search") ? "input" : "change", renderScholarships));
  $("heroSearch").addEventListener("submit", e => {
    e.preventDefault(); const q = $("globalSearch").value.trim(); if(!q) return;
    $("universitySearch").value = q; $("scholarshipSearch").value = q;
    renderUniversities(); renderScholarships();
    const uCount = data.universities.filter(u => [u.name,u.city,...u.areas].join(" ").toLowerCase().includes(q.toLowerCase())).length;
    const sCount = data.scholarships.filter(s => [s.name,s.provider,s.summary,...s.tags].join(" ").toLowerCase().includes(q.toLowerCase())).length;
    document.querySelector("#universities").scrollIntoView({behavior:"smooth"});
    if(!uCount && sCount) document.querySelector("#scholarships").scrollIntoView({behavior:"smooth"});
  });
  const nav = $("mainNav"), toggle = $("menuToggle");
  toggle.addEventListener("click", () => { const open = nav.classList.toggle("open"); toggle.setAttribute("aria-expanded", String(open)); toggle.textContent = open ? "×" : "☰"; });
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => { nav.classList.remove("open"); toggle.setAttribute("aria-expanded","false"); toggle.textContent="☰"; nav.querySelectorAll("a").forEach(x=>x.classList.remove("active")); a.classList.add("active"); }));
  renderUniversities(); renderScholarships(); renderUpdates();
})();