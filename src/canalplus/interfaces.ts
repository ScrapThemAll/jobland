interface HttpResponse {
  body: string
}

interface Poste {
	date: string,
	poste: string,
	link: string
}

interface PosteDetail {
	duree: string,
	contrat: string,
	context: string,
	mission: string,
	profil: string,
	niveau: string,
	experience: string
}

export { HttpResponse, Poste, PosteDetail };