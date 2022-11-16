/*jslint nomen: true */
/*global Publisher: false */
/*global nW1: false */
/* eslint-disable indent */


/*
  Lylaani, should you ever consent to allowing me to publish this to a waiting world I would need to provide some sort of disclaimer. Along these lines... 
  */

  if (!window.nW1) {
    window.nW1 = {};
  }

function getUrlParameter(sParam) {
  let sPageURL = window.location.search.substring(1),
    sURLVariables = sPageURL.split("&"),
    sParameterName,
    i;
  for (i = 0; i < sURLVariables.length; i++) {
    sParameterName = sURLVariables[i].split("=");
    if (sParameterName[0] == sParam) {
      return typeof sParameterName[1] === "undefined"
        ? true
        : decodeURIComponent(sParameterName[1]);
    }
  }
  return false;
}


const intro1 =
  "My colleague, Lylaani Dixon, has very kindly allowed me to repurpose one of her old sites as a playground for learning React. The existing site - maintained  largely for sentimental reasons - deploys an <a href='https://www.projectseven.com/support/updatepages/ssm.htm'>ancient javascript library</a> on the portfolio pages to deliver a rather involved gallery/slideshow/accordion that would provide a challenge to recreate both in React and pure ES6. Lylaani had been a freelance designer for a number of years when she was selected by &ldquo;The Rory Peck Trust&rdquo; not only to design and maintain their website but also to produce various print items most notably the programme for the annual <a href='https://rorypecktrust.org/'>The Rory Peck Awards</a> which we had printed (and designed, sort of) for the previous two years. It was better for all concerned to have a bona fide, London based, designer to assemble the information and shape the design for publication and we would collaborate closely over the ensuing decade.",
  intro2 = "This site is the vanilla JS version. The experimental <a href='https://knavesmireboy.github.io/minchinhampton/'>React</a> version utilises the browsers' localStorage API and markdown-esque markup to perform the rudimentary editing of the main content, replicating the functionality of a full-blown CMS. I eschewed the use of create-react-app in order to gain some familiarity with webpack and by extension the modern JS ecosystem. I will continue to use the site to explore further features of the framework, and in due course integrate a proper back-end. Lylanni's moved on from NW1 and her current endeavours can be found <a href='https://parish-council.website'>here</a>.";

const urlParams = window.URLSearchParams ? new window.URLSearchParams(window.location.search): {};

if (!urlParams.has) {
    urlParams.has = getUrlParameter;
}
//urlParams.has("cv")
if (1) {
    let U = nW1.utils,
    ops = nW1.ops,
    curry2 = U.curryRight(2),
    curryL2 = U.curryLeft(2),
    head = U.$Q("header"),
    anc = U.$Q('header a'),
    //doParaText = ops.append(ops.doTextNow(intro)),
    doParaText = curry2(ops.setInnerHTML)(intro1),
    doParaText2 = curry2(ops.setInnerHTML)(intro2),
    doPara = ops.append(ops.doMakeNow('p')),
    doPara2 = ops.append(ops.doMakeNow('p')),
    doLink = U.compose(doParaText2, doPara2, ops.getParent, doParaText.wrap(U.pass), doPara, ops.getParent2, ops.append(ops.doTextNow('close')), ops.setHref, ops.setId('exit').wrap(U.pass), ops.append(ops.doMakeNow('a'))),

    ptl = U.mittelFactory(false)(U.invokePair, 'insertBefore', anc);

   U.compose(doLink, ops.setId('intro').wrap(U.pass), curryL2(ptl)(head), ops.doMakeNow)("div");
  // console.log(head, anc);
}
