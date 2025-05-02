// src/chatbot/faq.js

const faqs = [
    {
      question: "cum împrumut o carte",
      keywords: ["împrumut", "carte", "cum"],
      answer: "Apasă pe cartea dorită, apoi pe butonul „Împrumută”. Selectează intervalul dorit, iar dacă este disponibil, vei primi un e-mail de confirmare."
    },
    {
      question: "câte cărți pot împrumuta simultan",
      keywords: ["câte", "cărți", "simultan", "împrumuta"],
      answer: "Poți avea până la 3 cărți împrumutate în același timp."
    },
    {
      question: "cum pot lua legătura cu un angajat",
      keywords: ["angajat", "contact", "email", "cum"],
      answer: "Ne poți contacta la adresa de e-mail: bibliotecaonlinesystem@gmail.com"
    },
    {
      question: "pot prelungi perioada unui împrumut",
      keywords: ["prelungi", "împrumut"],
      answer: "Poți prelungi perioada o singură dată cu încă 7 zile, din secțiunea „Împrumuturi curente”."
    },
    {
      question: "cum returnez o carte",
      keywords: ["returnez", "carte", "returnare"],
      answer: "Cărțile se returnează fizic la bibliotecă, la termenul stabilit. Dacă întârzii, va fi aplicată o taxă de întârziere, vizibilă în „Împrumuturi curente” la „Vezi taxa”."
    },
    {
      question: "cum îmi pot șterge contul",
      keywords: ["șterge", "cont", "profil"],
      answer: "Accesează secțiunea „Profil” apăsând pe iconița din dreapta sus, apoi selectează „Șterge cont”."
    },
    {
      question: "cum îmi pot edita datele personale",
      keywords: ["edita", "modifica", "date", "personale"],
      answer: "Accesează „Profil” și apasă pe „Editează profilul” pentru a modifica datele tale personale."
    },
    {
      question: "carte deteriorată",
      keywords: ["deteriorată", "stricată", "carte"],
      answer: "Te rugăm să ne contactezi. Pot exista penalizări sau taxe de înlocuire."
    },
    {
      question: "cum adaug o carte la favorite",
      keywords: ["favorite", "inimă", "adaugi"],
      answer: "În pagina unei cărți, apasă pe inima din colțul drept pentru a o adăuga la favorite."
    },
    {
      question: "ce este secțiunea recomandate",
      keywords: ["recomandate", "secțiune"],
      answer: "Este o selecție personalizată de titluri, bazată pe preferințele și istoricul tău de lectură."
    }
  ];
  
  // Verifică dacă întrebarea utilizatorului se potrivește cu una dintre cele de mai sus
  export function getFAQAnswer(userQuestion) {
    const lower = userQuestion.toLowerCase();
  
    for (const faq of faqs) {
      const matchedKeywords = faq.keywords.filter(word => lower.includes(word));
      if (matchedKeywords.length >= 2) {
        return faq.answer;
      }
    }
  
    return null; // Dacă nu s-a găsit nimic
  }