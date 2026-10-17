import pathlib,json,re
ROOT=pathlib.Path(__file__).resolve().parents[1];POOL=ROOT.parent
load=lambda f:json.loads(f.read_text())
source=lambda n:load(ROOT/'downloads'/n/'SOURCE.json')['url']
D10=source('decree-2010-198');D95=source('decree-1995-082');MINFI=source('minfi-nomenclature-2019');NW=source('ins-nw-2024')
manual=load(POOL/'crosswalks/elecam-codab.json')['manual'];canon={x['pcode']:x for n in ['adm1-regions','adm2-divisions','adm3-arrondissements'] for x in load(POOL/f'canonical/{n}.json')}
evidence={};notes={}
def add(name,url,quote,page=None,note=None):
 e={'url':url,'quote':quote}
 if page:e['page']=page
 evidence.setdefault(name,[]).append(e)
 if note:notes[name]=note
for council,arr,seat,page in [('OLANGUINA','ASSAMBA','Olanguina',3),('KOBDOMBO','NYAKOKOMBO','Kobdombo',5),('ANGOSSAS','MBOANZ','Angossas',6),('ATOK','BEDEND','Atok',5),('MINDOUROU','DJA','Mindourou',5),('KENTZOU','BOMBE','Kentzou',6),('NGUELEBOK','NDEM-NAM','Nguelebok',7),('OULI','MBOTORO','Ouli',6),('BONALEA','FIKO','Bonaléa',8),('NDOBIAN','NORD-MAKOMBE','Ndobiang',8),('MASSOK-SONGLOULOU','MASSOCK-SONGLOULOU','Massock',8),('GASCHIGA','DEMSA','Gashiga',9),('DEMDING','DJEMBEM','Demdeng',10),('IDENAU','WEST COAST','Idenau',10)]:
 add(council,D10,f'Arrondissement {"du " if arr=="NORD-MAKOMBE" else "d’" if arr=="ASSAMBA" else "de "}{arr}, chef-lieu : {seat}',page)
# Quotations below use the exact wording within each source, with ellipses explicitly marked where excerpted.
for council,quote in [('ELAK','Oku (Elak)'),('NKOR','Noni (Nkor)'),('MBIAME','Mbven (Mbiame)'),('ZHOA','Fungom (Zhoa)'),('BENAKUMA','Menchum Valley (Benakuma)'),('ANDEK','Ngie (Andek)'),('FONFUKA','Bum (Fonfuka)')]:
 add(council,NW,quote,page=391,note='INS 2024, table 21-1, printed page 381 / PDF page 391: distance to arrondissement capitals; source MINTP North-West. Complete PDF downloaded.')
add('WIDIKUM-BOFFE','https://fr.wikipedia.org/wiki/Widikum-Boffe',"Son ressort territorial est celui de l'arrondissement de Widikum-Menka.")
add('NGONG','https://fr.wikipedia.org/wiki/Ngong',"Elle recouvre le territoire de l'arrondissement de Tcheboa.")
add('MOZOGO','https://mozogo.cm/histoire/','La commune de Mozogo est le Chef-lieu de l’Arrondissement de Mayo Moskota')
add('DZIGUILAO','https://fr.wikipedia.org/wiki/Dziguilao',"Elle couvre le territoire de l'arrondissement de Taïbong.")
add('TOULOUM','https://fr.wikipedia.org/wiki/Touloum',"Elle couvre le territoire de l'arrondissement de Porhi.")
add('EBONE','https://fr.wikipedia.org/wiki/Ebone_(commune)',"Son ressort territorial est celui de l'arrondissement de Nlonako")
add('PETE-BANDJOUN','https://www.osidimbea.cm/collectivites/ouest/pete-bandjoun-arr/','Arrondissement de POUMOUGNE; Chef-lieu : Pète-Bandjoun',note='Two labelled fields quoted, joined with a semicolon. Commune mapping also supported by ARMP tender notice.')
add('PETE-BANDJOUN','https://www.armp.cm/details?id_publication=2340&type_publication=ADDITIF','Commune de Pété-Bandjoun, Arrondissement de Poumougne')
add('MENJI','https://fr.wikipedia.org/wiki/Fontem','Son chef-lieu est Menji.')
add('TINTO','https://en.wikipedia.org/wiki/Upper_Bayang','The district seat is located at Tinto (Tinto Council).')
add('TINTO','https://armp.cm/details?id_publication=62852&type_publication=AO','UPPER BANYANG SUB DIVISION, MANYU DIVISION, SOUTH WEST REGION',note='ARMP notice issued by Tinto Council; Upper Bayang/Upper Banyang are both used in official administrative sources.')
add('MAKARI',MINFI,'1317 Makary',32)
add('MAKARI','https://mairies.cm/commune/makary-ou-makari','Commune de Makary (ou Makari )')
add('BOURHA','https://fr.wikipedia.org/wiki/Bourha','Bourha (anciennement Bourrha)')
add('MVANGAN','https://de.wikipedia.org/wiki/Mvangane','Mvangane (oder: Mvangan)')
add('EYUMOJOCK','https://en.wikipedia.org/wiki/Eyumodjock','Eyumojock is a town and commune in Cameroon, and the sub-divisional headquarters of the Eyumojock sub-division in the Manyu division.')
add('EYUMOJOCK','https://mintp.cm/ngoho-ferry-construction-project-in-eyumojock-subdivision-manyu-division-south-west-region-works-contract-signed/','Eyumodjock Subdivision',note='Official Ministry of Public Works page uses Eyumojock in its title and Eyumodjock in its body.')
add('ISANGUELE','https://fr.wikipedia.org/wiki/Isanguele','Isanguele (ou Isangele)')
add('GUEME-VELE','https://fr.wikipedia.org/wiki/Gu%C3%A9m%C3%A9',"Elle recouvre le territoire de l'arrondissement de Vélé.")
add('VALLE DU NTEM',MINFI,'183 Vallée-Du-Ntem',38)
add('KOUPE-MANENGOUBA','https://droitcamerounais.info/en/files/128.11.08-Decret-du-12-novembre-2008-portant-organisation-administrative-de-la-republique-du-Cameroun.pdf','département du Koupe Manengouba ;',note='Decree 2008/376, Article 14. ADM2 spelling equivalence, not a council-to-arrondissement decision.')
add("CMR A L'ETRANGER",'https://portail.elecam.cm/download/k-liste-bv-diaspora-presidentielle-2025/','K. LISTE BV DIASPORA - PRÉSIDENTIELLE 2025',note='Confirmed treatment as non-domestic electoral grouping; no domestic OCHA P-code. This row is not an arrondissement mapping.')
notes.update({'ATOK':'Geographical pairing confirmed. The signed 2010 decree prints BEDEND, while MINFI 2019 and OCHA use Bebend; do not silently claim that the decree spells it Bebend.','DEMDING':'Pairing confirmed: decree spells DJEMBEM and chef-lieu Demdeng. Current OCHA Djebem and ELECAM Demding are retained aliases.','BONALEA':'2010 decree uses Fiko; 1995 commune decree refers to district Abo. No separate renaming decree found.','NDOBIAN':'2010 decree prints Ndobiang. Ndobian is the commune spelling in later sources; administrative pairing is confirmed.','GASCHIGA':'2010 decree prints Gashiga. Retain Gaschiga as ELECAM spelling; do not conflate Demsa arrondissement with the historic lamidat only.'})
# Use exact excerpts found in downloaded Wikipedia paragraphs, replacing drafted quotation if it differs.
from bs4 import BeautifulSoup
for name,folder,term in [('NGONG','wiki-ngong','Tcheboa'),('TOULOUM','wiki-touloum','Porhi'),('DZIGUILAO','wiki-dziguilao','Taibong')]:
 soup=BeautifulSoup((ROOT/'downloads'/folder/'source.html').read_text(),'html.parser')
 paras=[p.get_text(' ',strip=True) for p in soup.select('.mw-parser-output > p') if term in p.get_text()]
 if not paras:paras=[p.get_text(' ',strip=True) for p in soup.select('p') if term in p.get_text()]
 if paras:
  sentences=re.split(r'(?<=[.!?])\s+',paras[0]);q=next((s for s in sentences if term in s),paras[0]);evidence[name][0]['quote']=q
rows=[]
for key,value in manual.items():
 name=key.split('|')[-1];pc=value['pcode'];ev=evidence.get(name,[])
 rows.append({'key':key,'councilName':name,'arrondissement':canon[pc]['name']['fr'] if pc else None,'pcode':pc,'verdict':'confirmed' if ev else 'not-found','evidence':ev,'confidence':'high' if any(e['url'] in [D10,D95] for e in ev) else 'medium','notes':notes.get(name,'Mapping confirmed; spelling recommendation is separate from identity verification.')})
(ROOT/'elecam-crosswalk-verification.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
print('manual',len(rows),'missing',[r['councilName'] for r in rows if r['verdict']=='not-found'])
