import { Component, OnInit } from '@angular/core';
import { Series } from './multi-line-chart/multi-line-chart.component';
import { GraphDataService } from './graph-data.service';
import { GraphConfigurationService } from './graph-configuration.service';
import { CovidGraphDefinition } from 'src/lib/URLState';
import { combineLatest } from 'rxjs';
import zipWith from 'lodash/zipWith';

// if you're getting an error bc this doesn't exist, run git-version.sh
import { version } from '../environments/version';
import { ActivatedRoute } from '@angular/router';

interface Graph {
  data: Series[];
  definition: CovidGraphDefinition;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent implements OnInit {
  title = 'angular9covid-dashboard';
  graphs: Graph[];
  allGraphDefinitions: CovidGraphDefinition[]; // TODO refactor AutoSuggestComponent so that we can delete this and just depend on .graphs

  isEditing = false;
  editingIndex: number;

  isUrlEditor = false;

  version: typeof version;
  linkHref: string;

  constructor(
    public route: ActivatedRoute,
    private graphDataService: GraphDataService,
    private graphConfigurationService: GraphConfigurationService
  ) {
    // TODO should all this be in ngOnInit?
    combineLatest([
      graphDataService.graphData,
      graphConfigurationService.graphDefinitions,
    ]).subscribe(([graphData, graphDefinitions]) => {
      this.graphs = zipWith(
        graphData,
        graphDefinitions,
        (data, definition) => ({ data, definition })
      );
      this.allGraphDefinitions = graphDefinitions;
    });
    this.version = version;
  }

  ngOnInit() {
    setTimeout(() => this.updateLink(), 0);
  }

  startEditing(index: number) {
    this.isEditing = true;
    this.editingIndex = index;
  }

  stopEditing(): void {
    this.isEditing = false;
  }

  toggleUrlEditor() {
    this.isUrlEditor = !this.isUrlEditor;
  }

  updateLink() {
    const text: string = (document.getElementById(
      'urlEditorTextarea'
    ) as HTMLTextAreaElement).value;
    this.linkHref = text
      .split('\n')
      .map((line) =>
        ((line as any) /* bc trimLeft is a new js feature */
          .trimLeft() as string).replace(' ', '+')
      )
      .join('');
  }

  indent(event: KeyboardEvent) {
    // const textarea = event.target as HTMLTextAreaElement;
    // if (event.key === 't' && event.ctrlKey === true) {
    //   event.preventDefault();
    //   var start = textarea.selectionStart;
    //   var end = textarea.selectionEnd;
    //   // set textarea value to: text before caret + tab + text after caret
    //   textarea.value =
    //     textarea.value.substring(0, start) +
    //     '  ' +
    //     textarea.value.substring(end);
    //   // put caret at right position again
    //   textarea.selectionStart = textarea.selectionEnd = start + 1;
    //   // } else if (event.key === 't' && event.ctrlKey === true) {
    //   //   event.preventDefault();
    // }
  }
}
