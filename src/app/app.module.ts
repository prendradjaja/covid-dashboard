import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ExampleComponent } from './example/example.component';
import { Example2Component } from './example2/example2.component';
import { MultiLineChartComponent } from './multi-line-chart/multi-line-chart.component';
import { AutoSuggestComponent } from './auto-suggest/auto-suggest.component';
import { NumberInputComponent } from './number-input/number-input.component';

@NgModule({
  declarations: [
    AppComponent,
    ExampleComponent,
    Example2Component,
    MultiLineChartComponent,
    AutoSuggestComponent,
    NumberInputComponent,
  ],
  imports: [BrowserModule, AppRoutingModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
