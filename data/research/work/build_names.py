import json,pathlib,re
R=pathlib.Path(__file__).resolve().parents[1];P=R.parent
load=lambda p:json.loads(p.read_text())
src=lambda n:load(R/'downloads'/n/'SOURCE.json')['url']
MINFI=src('minfi-nomenclature-2019');D10=src('decree-2010-198');NW=src('ins-nw-2024')
issues=[x for x in load(P/'canonical/issues.json') if x['kind']=='name-variants']
cross=load(R/'elecam-crosswalk-verification.json');cross={x['pcode']:x for x in cross}
# Name and code copied from the ministry's administrative-code table; PDF and printed page numbers coincide.
table={
'Assamba':(29,'1141 Assamba'),'Bare-Bakem':(33,'1400 Bare-Bakem'),'Batchenga':(28,'1110 Batschenga'),'Bebend':(30,'1211 Bebend'),'Bombe':(31,'1221 Bombe'),'Bourrha':(33,'1350 Bourrha'),'Demsa':(34,'1503 Demsa'),'Dikome Balue':(39,'1951 Dikome-Balue'),'Dja':(30,'1213 Dja'),'Djebem':(36,'1731 Djembem'),'Edzendouan':(29,'1143 Edzendouan'),'Fiko':(33,'1402 Fiko'),'Fontem':(38,'1921 Fontem'),'Fungom':(35,'1630 Fungom'),'Isangele':(39,'1954 Isangele'),'Makary':(32,'1317 Makary'),'Malantouen':(37,'1776 Malentouen'),'Mamfe':(38,'1932 Mamfe'),'Massangam':(37,'1777 Massangam'),'Massock-Songloulou':(34,'1424 Massock-Songloulou'),'Mayo-Moskota':(33,'1353 Mayo-Moskota'),'Mboanz':(30,'1217 Mboanz'),'Mbotoro':(31,'1224 Mbotoro'),'Mbven':(35,'1612 Mbven'),'Menchum-Valley':(35,'1632 Menchum-Valley'),'Messok':(31,'121A Messok'),'Moloundou':(30,'1201 Moloundou'),'Mundemba':(39,'1957 Mundemba'),'Muyuka':(38,'1904 Muyuka'),'Mvangane':(37,'1816 Mvangane'),'Ndem Nam':(31,'1226 Ndem – Nam'),'Ngie':(36,'1652 Ngie'),'Njombe-Penja':(33,'1408 Njombe-Penja'),'Nkong-Ni':(36,'1743 Nkong-Ni'),'Nlonako':(33,'140C Nlonako'),'Noni':(35,'1614 Noni'),'Nord-Makombe':(33,'1411 Nord-Makombe'),'Nyakokombo':(30,'1184 Nyakokombo'),'Okola':(28,'1117 Okola'),'Oku':(35,'1615 Oku'),'Porhi':(32,'1335 Porhi'),'Poumougne':(36,'1732 Poumougne'),'Santchou':(36,'1745 Santchou'),'Taibong':(32,'1336 Taïbong'),'Tcheboa':(34,'150A Tcheboa'),'Tibati':(27,'1001 Tibati'),'Upper Bayang':(38,'1933 Upper-Bayang'),'Vele':(32,'1328 Vele'),'West-Coast':(38,'1906 West-Coast'),'Widikum':(36,'1654 Widikum')}
changes={'Dikome Balue':'Dikome-Balue','Djebem':'Djembem','Ndem Nam':'Ndem-Nam','Widikum':'Widikum-Menka'}
ambiguous={'Bebend','Malantouen','Mvangane','Upper Bayang'}
rows=[]
for x in issues:
 n=x['codab'];ev=[]
 if n in table:
  page,quote=table[n];ev.append({'url':MINFI,'quote':quote,'page':page,'kind':'official administrative usage','quoteNote':'Code and label cells joined; whitespace and line wraps normalized.'})
 if x['pcode'] in cross:ev+=cross[x['pcode']]['evidence']
 if n in ['Batchenga','Edzendouan','Dikome Balue','Messok']:
  name,page={'Batchenga':('BATCHENGA',2),'Edzendouan':('EDZENDOUAN',3),'Dikome Balue':('DIKOME-BALUE',11),'Messok':('MESSOK',6)}[n]
  ev.insert(0,{'url':D10,'quote':name,'page':page,'kind':'signed decree 2010/198'})
 if n in ['Bum','Njikwa','Widikum']:
  ev.insert(0,{'url':NW,'quote':{'Bum':'Bum (Fonfuka)','Njikwa':'Njikwa','Widikum':'Widikum-Menka'}[n],'page':391,'kind':'official administrative usage; table 21-1'})
 if n=='Fiko':ev.append({'url':src('decree-1995-082'),'quote':'Abo','kind':'1995 decree commune territorial reference'})
 if n=='Malantouen':ev.append({'url':'https://fr.wikipedia.org/wiki/Malentouen','quote':'Malentouen (ou Malantouen)','kind':'secondary spelling variants'})
 notes='Keep the arrondissement name; a commune or chef-lieu label is stored separately. Legal creation text not recovered for this row unless a decree is cited.'
 if n in ['Muyuka','Massangam','Santchou','Moloundou','Mundemba','Okola','Tibati','Makary']:
  notes='Recommended display spelling is supported by the official administrative table. Keep source variants as aliases; an exclusive statutory spelling has not been established.'
 if n=='Bebend':notes='Unresolved legal spelling: the signed 2010 decree prints BEDEND; MINFI 2019 prints Bebend. Keep Bebend pending a corrigendum or original district-creation text; do not conceal the discrepancy.'
 if n=='Djebem':notes='Recommend Djembem: both the signed 2010 decree (DJEMBEM, chef-lieu Demdeng) and MINFI 2019 support it. Preserve Djebem and Demding as source aliases.'
 if n=='Batchenga':notes='Keep Batchenga from the signed 2010 decree despite Batschenga in the later budget table.'
 if n=='Edzendouan':notes='Keep Edzendouan: signed decree and ministry table agree; retain Ezendouan only as source spelling.'
 if n=='Dikome Balue':notes='Use Dikome-Balue from the signed decree and ministry table; preserve Dikomba Balue as the BUCREP spelling.'
 if n=='Fiko':notes='Use Fiko for the arrondissement and Bonaléa for the commune/chef-lieu. The 1995 commune text names Abo; no separate Abo-to-Fiko renaming decree was found.'
 if n=='Bourrha':notes='Keep Bourrha as the ministry arrondissement spelling. Bourha is common commune usage; the primary act establishing a spelling change was not found.'
 if n=='Malantouen':notes='No exclusive legal spelling established. MINFI gives Malentouen; Wikipedia explicitly recognizes both. Keep current Malantouen until the creation/renaming act is recovered.'
 if n=='Mvangane':notes='No exclusive legal spelling established. MINFI uses Mvangane; commune/Wikipedia usage also has Mvangan. Keep current name and both aliases.'
 if n=='Upper Bayang':notes='No exclusive legal spelling established. MINFI uses Upper-Bayang; the ARMP/Tinto Council notice uses UPPER BANYANG. Keep both and retain the current display name.'
 if n=='Widikum':notes='Recommend Widikum-Menka as the fuller administrative name used by INS 2024; retain Widikum as the official abbreviated table form and Widikum-Boffe as commune name. Original creation act not found.'
 strong=any(e['url']==D10 for e in ev)
 rows.append({'pcode':x['pcode'],'current':n,'recommendedOfficialName':None if n in ambiguous else changes.get(n,n),'evidence':ev,'confidence':'low' if n in ambiguous else 'high' if strong else 'medium','legalStatus':'conflicting sources; not found conclusively' if n in ambiguous else 'decree wording recovered' if strong else 'official usage confirmed; exclusive legal spelling not found','recommendedAction':'keep pending legal clarification' if n in ambiguous else 'change display name; preserve aliases' if n in changes else 'keep; preserve source variants','notes':notes})
assert len(rows)==52 and all(r['evidence'] for r in rows)
(R/'official-names.json').write_text(json.dumps(rows,ensure_ascii=False,indent=2)+'\n')
print('names',len(rows),'unresolved',len(ambiguous))
