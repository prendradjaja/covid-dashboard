import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import URLState, { CovidGraphDefinition } from '../../lib/URLState';

@Component({
  selector: 'number-input',
  templateUrl: './number-input.component.html',
  styleUrls: ['./number-input.component.less'],
})
export class NumberInputComponent implements OnInit {
  @Input() label: string;
  @ViewChild('inputElement') inputElement: ElementRef<HTMLInputElement>;

  @Output() setValue = new EventEmitter<number>();

  constructor() {}

  ngOnInit(): void {}

  handleSetValue() {
    this.setValue.next(+this.inputElement.nativeElement.value)
  }
}
