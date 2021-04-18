import Component from './base-component'
import { Validatable, validate } from '../util/validation'
import { autobind } from '../decorators/autobind'
import { projectState } from '../state/project-state'


export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement
  descriptionInputElement: HTMLInputElement
  peopleInputElement: HTMLInputElement

  constructor() {
    super('project-input', 'app', true, 'user-input')

    this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement
    this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement
    this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement

    this.configure()
  }

  configure() {
    this.element.addEventListener('submit', this.submitHandler)
  }

  renderContent() { }

  private gatherUserInput(): [string, string, number] | void {
    const enterTitle = this.titleInputElement.value
    const enterDescription = this.descriptionInputElement.value
    const enterPeople = this.peopleInputElement.value

    const titleValidation: Validatable = {
      value: enterTitle,
      required: true
    }
    const descriptionValidation: Validatable = {
      value: enterDescription,
      required: true,
      minLength: 5
    }
    const peopleValidation: Validatable = {
      value: +enterPeople,
      required: true,
      max: 4,
      min: 1
    }
    if (
      !validate(titleValidation) ||
      !validate(descriptionValidation) ||
      !validate(peopleValidation)
    ) {
      alert('Wrong Input')
      return
    }
    return [enterTitle, enterDescription, +enterPeople]
  }

  private resetInput() {
    this.titleInputElement.value = ''
    this.descriptionInputElement.value = ''
    this.peopleInputElement.value = ''
  }
  @autobind
  private submitHandler(event: Event) {
    event.preventDefault()
    const userInput = this.gatherUserInput()
    if (Array.isArray(userInput)) {
      const [title, description, people] = userInput
      projectState.addProject(title, description, people)
      this.resetInput()
    }
  }

}