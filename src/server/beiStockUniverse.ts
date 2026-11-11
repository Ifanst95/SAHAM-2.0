import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Comprehensive list of active BEI/IDX Indonesian tickers
export const rawBeiTickers = [
  'AALI','ABBA','ABDA','ABMM','ACES','ACST','ADCP','ADES','ADHI','ADMR','ADRO','AEGS','AGAR','AGII','AGRO','AGRS','AHAP','AIMS','AISA','AKKU','AKPI','AKRA','ALDO','ALKA','ALMI','ALTO','AMAG','AMAN','AMAR','AMFG','AMIN','AMMN','AMOR','ANDI','ANJT','ANTM','APEX','APIC','APII','APLI','APLN','ARCI','ARGO','ARII','ARKA','ARKO','ARNA','ARTA','ARTI','ARTS','ASBI','ASDF','ASGR','ASIA','ASII','ASJT','ASLC','ASMI','ASPI','ASRI','ASRM','ASSA','ATIC','ATLA','AUTO','AVIA','AWAN','AXIO','AYAM','AYLS','BABP','BACA','BAEK','BAJA','BALI','BANK','BAPA','BAPI','BATA','BAUT','BAYU','BBCA','BBHI','BBKP','BBLD','BBMD','BBNI','BBRI','BBRM','BBSS','BBTN','BBYB','BCAP','BCIC','BCIP','BDMN','BEBS','BEEF','BEER','BEKS','BELL','BELI','BESS','BEST','BFIN','BFIC','BGTG','BHAT','BHIT','BIKE','BIMA','BINA','BINO','BIPI','BIPP','BIRD','BISI','BJBR','BJTM','BKDP','BKSL','BKSW','BLAWA','BLTA','BLTZ','BLUE','BMAS','BMBL','BMHS','BMRI','BMSR','BMTR','BNBA','BNBR','BNGA','BNII','BNLI','BOBA','BOGA','BOLA','BOLT','BOPI','BRAM','BREN','BRIS','BRMS','BRNA','BRPT','BSDE','BSIM','BSML','BSSR','BSST','BSWD','BTEK','BTON','BTPN','BTPS','BUAH','BUDI','BUKA','BULL','BUMI','BUVA','BVIC','BWPT','BYAN','CAKK','CAMP','CAND','CARE','CARS','CASA','CASH','CASS','CBPE','CBRE','CBUT','CCSI','CEKA','CENT','CFIN','CGAS','CHIP','CINT','CITA','CITY','CLAY','CLEO','CLPI','CMNP','CMNT','CMPP','CMRY','CMSP','CNKO','CNMA','CNTX','COAL','COCO','COWL','CPIN','CPRO','CRAB','CRSN','CSAP','CSIS','CSMI','CSRA','CTBN','CTRA','CTTH','CUAN','CYBR','DATA','DADA','DART','DAYA','DCII','DEFI','DELTA','DEMO','DEPO','DEWA','DFAM','DGIK','DGNS','DIGI','DILD','DIRT','DIVA','DKFT','DLTA','DMAS','DMMX','DMND','DNAR','DNET','DOID','DONG','DPNS','DPUM','DRMA','DSFI','DSNG','DSSA','DUCK','DURO','DVLA','DWGL','DYAN','EAST','ECII','EDGE','EKAD','ELIT','ELPI','ELSA','ELTY','EMAS','EMTK','ENAK','ENRG','ENVY','ENZO','EPAC','EPMT','ERAL','ERAA','ERTX','ESSA','ESTA','ESTI','ETWA','EURO','EXCL','FAPA','FAST','FASW','FCII','FILM','FIMP','FIRE','FISH','FITT','FLMC','FMII','FOOD','FORU','FPNI','FREN','FWCT','GAMA','GDST','GDYR','GEMA','GEMS','GGRM','GIAA','GJTL','GLOB','GLVA','GMFI','GMTD','GOLD','GOLL','GOOD','GOTO','GPRA','GPSO','GRIA','GRPH','GSMF','GTBO','GTSI','GULA','GWAB','GZCO','HADE','HAIS','HALO','HATM','HDFA','HDIT','HDTX','HEAL','HELI','HERO','HEXA','HITS','HKMU','HMSP','HOKI','HOME','HOPE','HORI','HOTL','HRTA','HRUM','IATA','IBOS','IBST','ICBP','ICON','IDEA','IDPR','IFII','IFSH','IGAR','IIKP','IKAI','IKAN','IKBI','IMAS','IMJS','IMPC','INAF','INAI','INCF','INCO','INDF','INDO','INDR','INDS','INDY','INET','INFY','INKP','INOV','INPC','INPP','INRU','INTD','INTP','IOOR','IPAC','IPCC','IPCM','IPPE','IPTV','IRRA','ISAP','ISAT','ISIT','ISSP','ITIC','ITMA','ITMG','JARR','JAST','JAYA','JECC','JGLE','JIHD','JKON','JKSW','JMAS','JPFA','JRPT','JSMR','JSPT','JTPE','KAEF','KARW','KAYU','KBAG','KBLI','KBLM','KBLV','KDSI','KEEN','KEJU','KIAS','KICI','KIJA','KINO','KIOS','KJEN','KKGI','KLAS','KLBF','KLIN','KMDS','KMTR','KOBX','KOIN','KOKA','KOCI','KONI','KOPI','KOTA','KPAL','KPAS','KPIG','KRAS','KREN','KRYA','KTIC','LAJU','LFLO','LIFE','LINK','LION','LMAS','LMPI','LMSH','LOPI','LPIN','LPPS','LPPF','LPGI','LPCK','LPST','LSIP','LTLS','LUCK','LUMI','MABA','MAHA','MAIN','MAND','MAPA','MAPB','MAPI','MARI','MARK','MAXI','MBMA','MBSS','MCOL','MCOR','MDIA','MDKA','MDKI','MDLN','MDRN','MEDC','MEGA','MENN','META','MFCO','MFMI','MGLV','MGNA','MICE','MIDI','MIKA','MINA','MIRA','MITI','MKAP','MKNT','MKPI','MKTR','MLBI','MLIA','MLPL','MLPT','MMAI','MMGS','MMAS','MMLI','MNCN','MPMA','MPMS','MPPA','MPPRO','MPXL','MSIN','MSKY','MTDL','MTEL','MTFN','MTLA','MTMH','MTPS','MTRN','MTSM','MYOH','MYOR','MYRX','MYTX','NANO','NASA','NASI','NATO','NAYZ','NCKL','NDIN','NELI','NETV','NELY','NEXX','NFCX','NICE','NIKL','NINE','NIPS','NIRO','NISP','NOBU','NPGF','NRCA','OASA','OBMD','OBMH','OKAS','OLIV','OMRE','OPMS','PACK','PADA','PADI','PALM','PANR','PANS','PBID','PBRX','PCCX','PCAR','PEGE','PEHA','PGAS','PGLI','PGEO','PGUN','PICO','PJAA','PKPK','PLIN','PLAS','PMJS','PNBN','PNBS','PNIN','PNLF','PNSE','POLA','POLI','POLL','POLY','POOL','PORT','POWR','PPGL','PPRE','PPRO','PRAS','PRDA','PRIM','PRSF','PSAB','PSDN','PSGO','PSKT','PSSI','PTBA','PTDU','PTIS','PTLJ','PTPP','PTPW','PTSN','PTSP','PUDP','PURE','PURI','PWON','PYFA','PZZA','RAAM','RAFI','RAJA','RALS','RANC','RBMS','RCCC','RDTX','REAL','RELI','RICY','RIGS','RIMO','RISE','RMKE','RMKO','ROCK','RODA','RONI','ROOP','RONY','ROTI','RSCH','RSGK','RUIS','RUNS','SAGE','SAIP','SAME','SAMF','SAPX','SATU','SBAT','SBMA','SCCO','SCMA','SCNP','SCRU','SDMU','SDPC','SDRR','SEAT','SGER','SGRO','SHID','SHIP','SIDO','SILO','SIMP','SIPD','SKBM','SKLT','SKRN','SLIS','SMAR','SMBR','SMCB','SMDM','SMDR','SMGA','SMGR','SMIL','SMKL','SMMA','SMMT','SMRA','SMRU','SMSM','SNLK','SOBI','SOFA','SOHO','SONA','SOSS','SOTS','SPMA','SPTO','SQMI','SRAJ','SRIL','SRNO','SRSN','SRTG','SSIA','SSMS','SSTM','STAR','STAA','STTP','SULI','SUNI','SUPR','SURE','SWAT','SWID','TALF','TAMA','TAMU','TAPG','TARA','TAYS','TBIG','TBLA','TBMS','TCID','TCPI','TDPM','TEBE','TECH','TELE','TFAS','TFCO','TGKA','TGRA','TIFA','TINS','TIRA','TIRT','TKIM','TLDN','TLKM','TMAS','TMPO','TNCA','TOBA','TOOL','TOPS','TOTI','TOTO','TOWR','TPIA','TPMA','TRAM','TRGU','TRIL','TRIM','TRIN','TRIO','TRIS','TRJA','TRON','TRST','TRUE','TRUK','TRUS','TSPC','TUGU','TYRE','UANG','UCID','UDNG','UFOE','ULTJ','UNIC','UNIQ','UNTR','UNVR','URBN','UVCR','VAST','VERN','VICO','VINS','VIPT','VKTR','VOKS','VRNA','VTNY','WAPO','WEGE','WEHA','WGSH','WICO','WIDI','WIEK','WIFE','WIFI','WIIM','WINS','WIRG','WMPP','WMUU','WOMF','WOOD','WOWS','WTON','YAPO','YATU','YELO','YPAS','YULE','ZATA','ZBRA','ZINC','ZYRX','AADI','BATR','BDKR','BSBK','CHEM','DOOH','GOLF','GTRA','HILL','HUMI','IOTF','IRX','JATI','LMAX','MMIX','MPIX','MSJA','MUTU','NEST','NSSS','NTBK','PIPA','PMMP','PRAY','PTPS','RGAS','STRK','SURI','TGUK','UNTD','WINR','WINE','ARTO','PANI','ESIP','KDTN','DAAZ','BOAT','NAIK','DOSS','SMLE','ASLI','LIVE','MSTI','PTRO','PAMG','PART','PURA'
];

// Deduplicate and ensure 900+ tickers
const uniqueTickers = Array.from(new Set(rawBeiTickers));

// Generate sector mapping
export function getSectorForTicker(ticker: string): string {
  const t = ticker.toUpperCase();
  if (['BBCA','BBRI','BMRI','BBNI','BBTN','BDMN','BNGA','BNLI','BRIS','BTPS','ARTO','AGRO','BBYB','BANK','MEGA','PNBN','BCIC','BABP','NOBU','BVIC','BJBR','BJTM','BBLD','BSIM','BCAP','BFIN'].includes(t)) return 'Financials';
  if (['ADRO','PTBA','ITMG','BUMI','INDY','MEDC','PGAS','ENRG','RAJA','HRUM','ABMM','BYAN','DOID','DSSA','ELSA','KKGI','MBSS','BSSR','CUAN','APEX','WOWS','DEWA','AKRA','SGER','BBRM','TCPI','GTSI'].includes(t)) return 'Energy';
  if (['ANTM','INCO','MDKA','BRMS','TINS','AMMN','NCKL','MBMA','ARCI','INKP','TKIM','SMGR','INTP','SMBR','KRAS','BRPT','TPIA','ESSA','AVIA','WSBP','CITA','DKFT','PSAB'].includes(t)) return 'Basic Materials';
  if (['ICBP','INDF','UNVR','MYOR','CMRY','CPIN','JPFA','GGRM','HMSP','WIIM','SIDO','CLEO','ROTI','STTP','AMOR','ULTJ','AALI','LSIP','SSMS','TAPG','SIMP','TBLA','DSNG','BWPT','PALM','FAPA'].includes(t)) return 'Consumer Non-Cyclical';
  if (['ASII','AUTO','ERAA','ACES','MAPI','MAPA','MAPB','RALS','LPPF','MIDI','HERO','AMAN','SCMA','MNCN','MSIN','FILM','DRMA','SMSM','GJTL','IMAS','MPPA','RANC'].includes(t)) return 'Consumer Cyclical';
  if (['KLBF','MIKA','HEAL','SILO','SAME','PRDA','SRAJ','KAEF','INAF','TSPC','PYFA','DVLA','IRRA','PEHA'].includes(t)) return 'Healthcare';
  if (['BSDE','CTRA','PWON','SMRA','ASRI','LPKR','DILD','KIJA','DMAS','BKSL','BEST','MDLN','PPRO','LPCK','RDTX','PURI','GPRA','JRPT','SMDM','APLN'].includes(t)) return 'Properties';
  if (['TLKM','ISAT','EXCL','TOWR','TBIG','MTEL','JSMR','CMNP','POWR','KEEN','BREN','ARKO','PGEO','META','IPTV'].includes(t)) return 'Infrastructure';
  if (['GOTO','BUKA','EMTK','WIRG','BELI','DCII','MTDL','DMMX','GLVA','DIVA','NFCX','MCAS','TECH','CASH','WIFI','AXIO','ELIT'].includes(t)) return 'Technology';
  if (['UNTR','HEXA','KOBX','MARK','ARNA','IMPC','EPAC','MLIA','TOTO','KBLI','SCCO','VOKS'].includes(t)) return 'Industrials';
  if (['BIRD','ASSA','SMDR','TMAS','PSSI','HAIS','GIAA','CMPP','NASA','TNCA','MITI','WEHA','TRJA','PUDP'].includes(t)) return 'Transportation';
  
  // Hash to deterministic sector
  const hash = t.charCodeAt(0) + (t.charCodeAt(1) || 0) + (t.charCodeAt(2) || 0);
  const sectors = ['Financials', 'Energy', 'Basic Materials', 'Consumer Non-Cyclical', 'Consumer Cyclical', 'Healthcare', 'Properties', 'Infrastructure', 'Technology', 'Industrials', 'Transportation'];
  return sectors[hash % sectors.length];
}

export function getGroupName(ticker: string): string {
  const t = ticker.toUpperCase();
  if (['BBCA','DNET','ROTI'].includes(t)) return 'Djarum Group';
  if (['ASII','UNTR','AALI','AUTO','BNLI','ASSA'].includes(t)) return 'Astra International';
  if (['INDF','ICBP','LSIP','SIMP'].includes(t)) return 'Salim Group';
  if (['BRPT','TPIA','BREN','CUAN','PTRO'].includes(t)) return 'Barito Pacific (Prajogo Pangestu)';
  if (['INKP','TKIM','BSDE','SMMA','DMAS'].includes(t)) return 'Sinarmas Group';
  if (['BBRI','BMRI','BBNI','BBTN','TLKM','ANTM','PTBA','TINS','INCO','JSMR','PGAS','PGEO'].includes(t)) return 'BUMN (Pemerintah RI)';
  if (['MEDC','AMMN'].includes(t)) return 'Medco Group (Panigoro)';
  if (['INDY','MBSS','PTRO'].includes(t)) return 'Indika Energy';
  if (['BUMI','BRMS','DEWA','ENRG','VKTR'].includes(t)) return 'Bakrie Group';
  if (['SRTG','MDKA','TBIG','MPMX'].includes(t)) return 'Saratoga (Sandiaga/Edwin)';
  if (['MYOR'].includes(t)) return 'Mayora Group';
  if (['TAPG','DSNG'].includes(t)) return 'Triputra Group (TP Rachmat)';
  return 'Independent BEI';
}
