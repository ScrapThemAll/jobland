const got = require('got');
const { task, waitAll, of, rejected } = require('folktale/data/task');
const Result = require('folktale/data/result');
const cheerio = require('cheerio');
import { HttpResponse, Poste, PosteDetail } from './interfaces';

const url = 'http://www.vousmeritezcanalplus.com';

const api = {
	getJobs
}

module.exports = api;
export default api;

const httpGet = (url: string) =>
  task(resolver => 
    got(url)
    .then((data: HttpResponse) => resolver.resolve(data.body))
		.catch(resolver.reject)
  );

const resultToTask = e =>
	e.matchWith({
		Ok: ({value}) => of(value),
		Error: ({value}) => rejected(value)
	})


function getJobs(page: number): Promise<any> {
	return httpGet(`${url}/offres-d-emploi.html?page=${page + 1}`)
		.map(getPostes)
		.chain(resultToTask)
		.chain((postes: Poste[]) =>
			waitAll(postes.map(poste => 
				httpGet(poste.link).map(getPosteDetail).map((posteDetail: PosteDetail) => Object.assign(poste, posteDetail))
			))
		)
		.run()
		.promise();
}
  
function getPostes(html: string) {
	const $ = cheerio.load(html);
	return Result.fromNullable(
		$('li.offre_distribution').map((i, elem) => {
			const date = $(elem).children('.date').text();
			const poste = $(elem).children('.titre').text();
			var link = `${url}${$(elem).children('.lien_offre').attr('href')}`;
			return {date, poste, link};
		}).get()
	);
}

function getPosteDetail(html: string) {
	const $ = cheerio.load(html);
	const header = $('div#offerHeader');
	const contrat = header.children('.offerHeaderBloc').children('.typeContrat');
	const duree = header.children('.offerHeaderBloc').next().children().next().first();
	const context = header.next().next();
	const mission = context.next().next();
	const profil = mission.next().next();
	const niveau = profil.next().next();
	const experience = niveau.next().next();

	return {
		duree: duree.text(),
		contrat: contrat.text(),
		context: context.text(),
		mission: mission.text(),
		profil: profil.text(),
		niveau: niveau.text(),
		experience: experience.text()
	};
}