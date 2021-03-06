﻿/*
//DESCRIPTION: Convert Footnotes to Endnotes  ( Uses the cross-reference function from InDesign )
# Acknowledgements
I derived the idea of using InDesign cross references for endnotes from Peter Kahrel. Peters solution is still a good source of inspiration and can be found here [http://www.kahrel.plus.com/indesign/footnotes.html](http://www.kahrel.plus.com/indesign/footnotes.html)

@Version: 3.2
@Date: 2017-06-14
@Author: Gregor Fellenz https://www.publishingx.de/
*/
/* 
    InDesign endnote solution based on scripting and cross references. 
    Copyright (C) 2015  Gregor Fellenz

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var px = {
	// Configurations settings for style names -- changes is save 
	pStyleEndnoteName:"Anm", // Absatzformat der Endnote. Das Format sollte automatisch nummeriert sein. Wenn es im Dokument vorhanden ist, wird es in der GUI vorausgewählt.
	pStyleEndnoteFollowName:"Anm~folge", // Absatzformat für Endnoten mit mehr als einem Absatz. Das Format sollte automatisch nummeriert sein. Wenn es im Dokument vorhanden ist, wird es in der GUI vorausgewählt.
	
	// Endnote block structure 
	pStyleEndnoteHeadingName:"endnote_block_title", // Absatzformat der Endnotenüberschrift
	pStyleEndnoteSplitHeadingName:"endnote_block_section", // Absatzformat für die wiederholten Überschriften (wdh von: pStylePrefix) 
	pStyleEndnoteSplitHeadingPrecedingRepeatName:"endnote_block_section_preceding", // Absatzformat für Absätze vor wiederholten Überschriften (wdh von: pStyleEndnoteSplitHeadingPrecedingName)
	pStyleEndnoteSplitHeadingFollowingRepeatName:"endnote_block_section_following", // Absatzformat für Absätze vor wiederholten Überschriften (wdh von: pStyleEndnoteSplitHeadingPrecedingName)
	
	cStyleEndnoteMarkerName:"Endnotenzähler", // Zeichenformat des Endnotenmarkers. Wenn es im Dokument vorhanden ist, wird es in der GUI vorausgewählt.
	crossRefStyleEndnoteName:"EndnotenMarker", // Querverweisformat. Kann nicht in der GUI ausgewählt werden.
	
	endnoteHeadingString:"Endnoten", // Default Text für die Entnotenüberschrift

	// Section Structure
	pStylePrefix:"u1", // Präfix der Überschriften an denen die Endnotenzählung geteilt wird.
	pStyleEndnoteSplitHeadingPrecedingName:"U1_Pre", // Absatzformat für Absätze, die kopiert werden sollen
	pStyleEndnoteSplitHeadingFollowingName:"U1_Follow", //  Absatzformat für Absätze, die kopiert werden sollen

	// Ignore Footnote Style
	pStyleFootnoteIgnoreName:"footnote_keep", // Absatzformate für Fußnoten, die nicht konvertiert werden sollen

	// User interface strings -- translation and changes are save
	ui:{
		// all scripts 
		saveDoc:{en:"Document is not saved", de:"Dokument ist nicht gespeichert"},
		saveDocInfo:{en:"Save your document first!\rSave and continue?", de:"Das Dokument muss zuerst gespeichert werden!\rSpeichern und fortfahren?"},
		saveDocFail:{en:"Could not save file.\n", de:"Die Datei konnte nicht gespeichert werden.\n"},
		errorInfo:{en:"Error during execution: ", de:"Fehler bei der Ausführung: "},		
		versionWarning:{en:"To run this script InDesign CS5 is required", de:"Für dieses Skript wird mindestens InDesign CS5 benötigt"},
		scriptVersionWarning:{en:"The document has been created with Version (v%1). Compatibility can not be guaranteed.\nPlease check carefully.", de:"Das Dokument wurde mit Version (v%1) erstellt. Die Kompatibilität kann nicht garantiert werden.\nBitte prüfen Sie genau."},
		emptyEndnotePar:{en:"%1 empty Pargraph(s) with endnote format [%2]. Please delete or assign another format.\nScript will end.", de:"%1 Absätze ohne Inhalt sind mit dem Format [%2] ausgezeichnet. Bitte weisen Sie ein anderes Format zu oder löschen Sie die Absätze.\nDas Skript wird beendet."},	
		emptyEndnoteParContent:{en:"Preceding Paragraph: ", de:"Absatz vor leerem Anmerkungsabsatz zur Fehlersuche: "},	
		// createEndnotes.jsx		
		menuTitle:{en:"Convert footnotes to endnotes v%1", de:"Fußnoten zu Endnoten konvertieren v%1"},		
		resultInfo:{en:"[%1] footnotes converted to endnotes!", de:"Es wurden [%1] Fußnoten zu Endnoten konvertiert!"},
		resultInfoConvert:{en:"[%1] backlinks created.\nDo not update the crossreferences!", de:"Es wurden [%1] Backlinks erstellt.\nDie Querverweise dürfen jetzt nicht mehr aktualisiert werden."},
		couldNotCreateBacklink:{en:"Could not create backlink for [%1]", de:"Konnte Backlink für [%1] nicht erstellen"},
		
		addBacklinkWarning:{en:"After conversion, the endnotes can no longer be extended / changed by script!\nContinue?", de:"Nach der Konvertierung können die Endnoten nicht mehr per Skript erweitert/verändert werden!\nFortfahren?"},
		deleteAllWarning:{en:"Do you really want to delete ALL endnote structures (cross-references and text anchors)?", de:"Sollen wirklich ALLE Endnotenstrukturen (Querverweise und Textanker) gelöscht werden?"},
		
		noTextInDoc:{en:"No text in document", de:"Es ist kein Text im Dokument enthalten"},
		noFootnoteInDoc:{en:"No footnote in document", de:"Es gibt keine Fußnote im Dokument"},
		multipleEndnoteLinks:{en:"More than one story with endnotes, cannot process this document.", de:"In mehr ale einem Textabschnitt befinden sich Endnoten, dieses Dokument kann nicht verarbeitet werden."},
		willProcessCurrentSelection:{en:"More than one story with footnotes, will process the current story (cursor position)", de:"Mehr als ein Textabschnitt enthält Fußnoten, es wird der aktuelle Textabschnitt (Position der Einfügemarke) verarbeitet."},
		createSelection:{en:"More than one story with footnotes, place cursor in story and restart", de:"Mehr als ein Textabschnitt enthält Fußnoten, bitte positionieren Sie die Einfügemarke im gewünschten Textabschnitt"},
		endnoteAndFootnotesAreNotInTheSameStory:{en:"Endnotes and Footnotes are not in the same story", de:"Endnoten und Fußnoten sind nicht im gleichen Textabschnitt!"},
		unknownSelectionError:{en:"Could not determine the footnote story", de:"Der Textabschnitt mit den Fußnoten konnte nicht ermittelt werden!"},
		wrongEndnoteOrder:{en:"Position of endnote [%1] is not in sync with story flow.\nCheck your document.", de:"Die Position der Endnote [%1] entspricht nicht dem Textfluss.\nPrüfen Sie das Dokument."},
		emptyFootnote:{en:"Cannot process footnotes without text.", de:"Fußnoten ohne Text können nicht verarbeitet werden."},
		hyperlinkAlreadyExists:{en:"Endnote %1 has already a hyperlink, cannot create Backlink.", de:"Endnote %1 enthält bereits einen Hyperlink. Es kann kein Backlink erstellt werden."},
		hyperlinkProblemDestination:{en:"Destinaton of Hyperlink [%1] with source text [%2] was deleted.", de:"Das Ziel des Hyperlinks [%1] mit dem Quelltext [%2] wurde gelöscht."},	
		hyperlinkProblemSource:{en:"Source of Hyperlink [%1] with destination text [%2] was deleted.", de:"Die Quelle des Hyperlinks [%1] mit dem Zieltext [%2] wurde gelöscht."},	
		parDestProblemDestination:{en:"On page [%1] in paragraph [%2] is a Textanchor [%3] without Hyperlink.\nEndnote marker was accidentally deleted?", de:"Auf Seite [%1] im Absatz [%2] steht ein Zielanker [%3], auf den kein Hyperlink zeigt.\nVielleicht wurde der Endnotemarker versehentlich gelöscht?"},	
		missingHyperlinkDestination:{en:"Hyperlink [%1] has no destination. Endnote is probably deleted!", de:"Ein Hyperlink [ID: %1] hat kein Ziel (Endnote) mehr. Die Endnote wurde vermutlich gelöscht!"},
		NumberOfHLinksNotParDest:{en:"Number of Hyperlinks (Endnote marker)  [%1] does not equal Number of destinations (endnotes) [%2]", de:"Die Anzahl der Hyperlinks (Endnoten marker) [%1] entspricht nicht der Anzahl Destinations (Endnoten) [%2]"},
		hyperlinkInWrongStory:{en:"Hyperlink with ID [%1] isn't located in the endnote story, instead in story with ID [%2]", de:"Der Hyperlink mit der ID [%1] ist nicht in der Endnoten-Story, sondern in der Story mit der ID  [%2]"},
		sectionBroken:{en:"More sections than headings, endnote were inserted before the first section", de:"Mehr Abschnitte als Abschnittsüberschriften. Die Endnoten wurden vor dem ersten Abschnitt eingefügt."},
		
		methodPanel:{en:"Mode",de:"Verarbeitungsmodus"},
		splitByHeading:{en:"Split by paragraph style",de:"Anhand von Absatzformat trennen (Bildet Abschnitte für Kapitel)"},
		continuousNumbering:{en:"Continuous numbering",de:"Fortlaufend nummerieren (Alle Endnoten in einem Abschnitt)"},
		ignoreFootnotesByStyle:{en:"Ignore footnotes with paragraph style",de:"Ignoriere Fußnote mit dem Absatzformat"},		
		
		splitFormatPanel:{en:"Split endnote configuration",de:"Formatpräfix an dem die Endnoten geteilt werden"},
		splitByHeadingStyle:{en:"Split paragraph style/heading",de:"Format zur Aufteilung in Abschnitte"},
		endNoteSplitHeadingParagraphStyle:{en:"Paragraph style for repeated headings",de:"Absatzformat wiederholte Überschriften"},

		endNoteSplitHeadingParagraphStylePreceding:{en:"Copy preceding paragraph formated by:",de:"Vorherigen Absatz kopieren, Formatvorgabe:"},
		endNoteSplitHeadingParagraphStyleFollowing:{en:"Copy following paragraph formated by:",de:"Folgenden Absatz kopieren, Formatvorgabe:"},		
		endNoteSplitHeadingParagraphStylePrecedingFollowingRepeat:{en:"Paragraph style for repeated paragraphs:",de:"Wiederholten Absatz formatieren:"},
		
		formatWarnung:{en:"Caution: Any Text formatted in paragraph style for repeated headings will be deleted. Use only in endnote area!",de:"Achtung: Texte, die mit den Absatzformaten für wiederholte (Über)schriften formatiert sind, werden gelöscht. Verwenden Sie diese Formate nur im Bereich der Endnoten."},
		
		formatPanel:{en:"Endnote styling",de:"Formate der Endnoten"},
		endnoteParagraphStyle:{en:"Paragraph style endnote",de:"Absatzformat Endnote"},
		endnoteFollowParagraphStyle:{en:"Paragraph Style followup paragraph",de:"Absatzformat Folgeabsatz"},
		endnoteMarkerCharacterStyle:{en:"Character style endnote marker",de:"Zeichenformat Endnotenmarker"},
		
		endNoteHeadingPanel:{en:"Endnote Block",de:"Endnotentitel"},
		endNoteHeading:{en:"Heading",de:"Titelzeile"},
		endNoteHeadingParagraphStyle:{en:"Paragraph style heading",de:"Absatzformat Endnotentitel"},
		cancelButton:{en:"Cancel",de:"Abbrechen"},
		okButton:{en:"Convert footnotes",de:"Konvertiere Fußnoten"},
		saveButton:{en:"Save Settings in document",de:"Einstellungen im Dokument speichern"},
		
		
		invalidSelection:{en:"Invalid Selection", de:"Ungültige Auswahl"},
		headingStyleFail:{en:"The choosen heading [%1] does not match the heading text [%2] in your document. \n\Please check the result!", de:"Die von Ihnen gewünschte Überschrift [%1] stimmt nicht mit dem Überschriftentext [%2] im Dokument überein. \n\nBitte prüfen Sie das Ergebnis!"},
		headingStyleFailBlock:{en:"The chosen heading [%1] in format [%1] cannot be found in the document. \n\Please check the result!", de:"Die von Ihnen gewünschte Überschrift [%1] mit dem Format [%2] kann nicht gefunden werden. \n\nBitte prüfen Sie das Ergebnis!"},
		headingStyleFailBlockMoreThanOne:{en:"The chosen heading [%1] in format [%1] is on more than one location in the document. \n\Please check the result!", de:"Die von Ihnen gewünschte Überschrift [%1] mit dem Format [%2] ist an mehreren Stellen im Dokument gefunden worden.\n\nBitte prüfen Sie das Ergebnis!"},
		headingStyleFailInfo:{en:"[%1] Texts with heading style deleted", de:"[%1] Textbereiche mit Überschriftenformat gelöscht"},
		
		statusFail:{en:"Undocumented Error! - Please send the document to the support!", de:"Unklarer Status! - Bitte senden Sie das Dokument an den Support!"},
		numberingFail:{en:"Followup paragraph not found! Numbering may be faulty!", de:"Folgeabsatz nicht gefunden! Nummerierung ggf. fehlerhaft!"},
		endnoteLinkInCell:{en:"Endnote marker must not reside in a cell wihtin another Table or anchored Frame", de:"Der Endnotenmaker darf nicht in einer Tabellenzelle, die zu einer anderen Tabelle oder einem verankerten Rahmen gehört, platziert sein!"},		
		endnoteLinkInAnchoredFrame:{en:"Endnote marker must not reside in a anchored Frame wihtin another anchored Frame or Table", de:"Der Endnotenmaker darf nicht in einem verankerten Rahmen, der zu einem verankerten Rahmen  oder einer anderen Tabelle gehört, platziert sein!"},
		
		sectionIsEmpty:{en:"Section is empty! Numbering may be faulty!", de:"Abschnitt ist leer! Nummerierung ggf. fehlerhaft!"},
		newPagesAdded:{en:"There were %1 pages added. Please check the document", de:"Es wurden %1 Seiten hinzugefügt. Bitte prüfen Sie den Umfang"},
		positionFail:{en:"There was an error in the endnote position analysis!\Please contact support!", de:"Es ist ein Fehler bei der Endnotenpositionsanalyse aufgetreten!\nBitte kontaktieren Sie den Support!"},		
		samePStyle:{en:"The paragraph format [%1] was also selected for the followup paragraphs, this could lead to numbering errors! The format has been duplicated.", de:"Das Absatzformat [%1] wurde auch für die Folgeabsätze ausgewählt, dies führt ggf. zu Nummerierungsfehlern! Das Format wurde dupliziert."},
		crossrefFormatFail:{en:"The cross-reference format [%1] already exists.\nThe selected different character style [%2] was set!", de:"Das Querverweisformat [%1] ist bereits vorhanden.\nDas ausgewählte aber abweichende Zeichenformat [%2] wurde eingestellt!"},
		endnoteStyleNumberingDeactivate:{en:"In Paragraph Style [%1] the option \n[Bullets and Numbering] -> [List Type : Numbes ] was deactivated.", de:"Im Absatzformat [%1] wurde die Option \n[Aufzählungszeichen und Nummerierung] -> [Listentyp: Nummerierung] deaktiviert."},
		headingFail:{en:"For the title at least one character must be entered.",de:"Für den Titel muss mindestens ein Zeichen eingegeben werden."},
		headingStyleSelectionFail:{en:"Endnote title paragraph style cannot be the same style as repeated section headings.",de:"Absatzformat des Endnotentitels kann nicht der von einer wiederholten Abscnittsüberschrift sein!"},
		styleSelectionFail:{en:"Error in the format selection", de:"Fehler bei der Formatauswahl"},
		styleSelectionFailSection:{en:"Error in the format selection of the section creation.", de:"Fehler bei der Formatauswahl für die Abschnittsbildung"},
		endnoteStoryMoved:{en:"Text and endnotes must be in the same Story\nPlease copy the endnote text to the end of the text portion", de:"Text und Endnoten müssen sich im gleichen InDesign Textabschnitt befinden!\nBitte kopieren Sie den Endnoten-Text an das Ende des Textabschnitts."},

		// deleteEndnotes.jsx
		noEndnoteOrMarker:{en:"The insertion point must be placed within an endnote or before the endnote marker.", de:"Die Einfügemarke muss innerhalb einer Endnote oder vor dem Endnotenmarker platziert sein."},
		deleteEndnoteName:{en:"Remove endnote",de:"Endnote entfernen"},
		confirmEndnoteDelete:{en:"Remove Endnote %1 \n\n%2",de:"Endnote löschen %1 \n\n%2"},

	},



	// Careful with changes below, changing options might break the update process of previously converted documents
	createBackupCopy:true,
	backupCopySuffix:"_endnoteBackupt.indd",
	
	numberBySection:true,
	
	hyperlinkLabel:"px:Foot2EndnoteHyperlink", // Markierung der SkriptQuerverweise
	endnoteHeadingStringLabel:"px:Foot2EndnoteHeadingString", 
	
	dokParagraphStyles:[],
	dokParagraphStyleNames:[],
	dokCharacterStyles:[],
	dokCharacterStyleNames:[],
	
	pStyleEndnote:undefined,
	pStyleEndnoteIndex:0,
	pStyleEndnoteLabel:"px:Foot2EndnoteParagraphStyle",
	
	pStyleEndnoteFollow:undefined,
	pStyleEndnoteFollowIndex:0,
	pStyleEndnoteFollowLabel:"px:Foot2EndnoteParagraphStyleFollowing",
	
	pStyleEndnoteHeading:undefined,
	pStyleEndnoteHeadingIndex:0,
	pStyleEndnoteHeadingLabel:"px:Foot2EndnoteParagraphStyleHeading",
	
	pStyleEndnoteSplitHeading:undefined,
	pStyleEndnoteSplitHeadingIndex:0,
	pStyleEndnoteSplitHeadingLabel:"px:Foot2EndnoteParagraphStyleSplitHeading",

	pStyleEndnoteSplitHeadingPreceding:undefined,
	pStyleEndnoteSplitHeadingPrecedingIndex:0,
	pStyleEndnoteSplitHeadingPrecedingLabel:"px:Foot2EndnoteParagraphStyleSplitHeadingPreceding",

	pStyleEndnoteSplitHeadingPrecedingRepeat:undefined,
	pStyleEndnoteSplitHeadingPrecedingRepeatIndex:0,
	pStyleEndnoteSplitHeadingPrecedingRepeatLabel:"px:Foot2EndnoteParagraphStyleSplitHeadingPrecedingRepeat",

	pStyleEndnoteSplitHeadingPrecedingCopy:false,
	pStyleEndnoteSplitHeadingPrecedingCopyLabel:"px:Foot2EndnoteParagraphStyleSplitHeadingPrecedingCopy",
	
	pStyleEndnoteSplitHeadingFollowing:undefined,
	pStyleEndnoteSplitHeadingFollowingIndex:0,
	pStyleEndnoteSplitHeadingFollowingLabel:"px:Foot2EndnoteParagraphStyleSplitHeadingFollowing",

	pStyleEndnoteSplitHeadingFollowingRepeat:undefined,
	pStyleEndnoteSplitHeadingFollowingRepeatIndex:0,
	pStyleEndnoteSplitHeadingFollowingRepeatLabel:"px:Foot2EndnoteParagraphStyleSplitHeadingRepeatFollowing",

	footnoteIgnore:false,
	footnoteIgnoreLabel:"px:Foot2EndnoteFootnoteIgnore",
	
	pStyleFootnoteIgnore:undefined,
	pStyleFootnoteIgnoreIndex:0,
	pStyleFootnoteIgnoreLabel:"px:Foot2EndnoteParagraphStyleFootnoteIgnore",
	

	pStyleEndnoteSplitHeadingFollowingCopy:false,
	pStyleEndnoteSplitHeadingFollowingCopyLabel:"px:Foot2EndnoteParagraphStyleSplitHeadingFollowingCopy",
	
	cStyleEndnoteMarker:undefined,
	cStyleEndnoteMarkerIndex:0,
	cStyleEndnoteMarkerLabel:"px:Foot2EndnoteCharacterStyle",	
	
	dokParagraphStylePrefixes:[],
	dokParagraphStylePrefixStyles:[],
	
	pStylePrefixMarkerLabel:"px:Foot2EndnoteSplitPrefix",
	numberBySectionLabel:"px:numberBySection",
	
	scriptVersionLabel:"px:Foot2EndnoteVersion",
	scriptMajorVersion:"3",
	
	foot2EndCounter:0,
	debug:false,
	showGui:true,
	logFileName:"endnoteLog.txt",
	ids:undefined,
	version:"3.2-2017-06-14",	
	projectName:"InDesign Endnotes"		
	
}

