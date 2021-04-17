interface Validatable {
  value: string | number
  required?: boolean
  maxLength?: number
  minLength?: number
  min?: number
  max?: number
}

function validate(validatableInput: Validatable) {
  let isValid = true
  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0
  }
  if (validatableInput.minLength != null && typeof validatableInput.value === 'string') {
    isValid = isValid && validatableInput.value.length >= validatableInput.minLength
  }
  if (validatableInput.maxLength != null && typeof validatableInput.value === 'string') {
    isValid = isValid && validatableInput.value.length <= validatableInput.maxLength
  }
  if (validatableInput.min != null && typeof validatableInput.value === 'number') {
    isValid = isValid && validatableInput.value >= validatableInput.min
  }
  if (validatableInput.max != null && typeof validatableInput.value === 'number') {
    isValid = isValid && validatableInput.value <= validatableInput.max
  }
  return isValid
}

function autobind(_: any, _2: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    get() {
      return originalMethod.bind(this)
    }
  }
  return adjDescriptor
}

enum ProjectStatus { Active, Finished }
//project type 
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) { }
}

type Listener = (items: Project[]) => void

// project state manager
class ProjectState {
  private listeners: Listener[] = []
  private projects: Project[] = []
  private static instance: ProjectState

  private constructor() { }

  static getInstance() {
    if (this.instance) {
      return this.instance
    }
    this.instance = new ProjectState()
    return this.instance
  }

  addListeners(listenerFn: Listener) {
    this.listeners.push(listenerFn)
  }

  addProject(title: string, description: string, numOfPeople: number) {
    this.projects.push(new Project(
      Math.random().toString(),
      title,
      description,
      numOfPeople,
      ProjectStatus.Active
    ))
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice())
    }
  }
}

const projectState = ProjectState.getInstance()

//projectList class
class ProjectList {
  templateElement: HTMLTemplateElement
  hostElement: HTMLDivElement
  element: HTMLElement
  assignedProjects: Project[]

  constructor(private type: 'active' | 'finished') {
    this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement
    this.hostElement = document.getElementById('app')! as HTMLDivElement
    this.assignedProjects = []

    const importedNode = document.importNode(this.templateElement.content, true)
    this.element = importedNode.firstElementChild as HTMLElement
    this.element.id = `${this.type}-projects`

    projectState.addListeners((projects: Project[]) => {
      this.assignedProjects = projects
      this.renderProjects()
    })

    this.attach()
    this.renderContent()
  }

  private renderProjects() {
    const listEl = document.getElementById(`${this.type}-project-list`)! as HTMLUListElement
    for (const prjItem of this.assignedProjects) {
      const listItem = document.createElement('li')
      listItem.textContent = prjItem.title
      listEl.appendChild(listItem)
    }

  }

  private renderContent() {
    const listId = `${this.type}-project-list`
    this.element.querySelector('ul')!.id = listId
    this.element.querySelector('h2')!.textContent = this.type.toUpperCase() + ' PROJECTS'
  }
  private attach() {
    this.hostElement.insertAdjacentElement('beforeend', this.element)
  }
}

//projectInput class
class ProjectInput {
  templateElement: HTMLTemplateElement
  hostElement: HTMLDivElement
  element: HTMLFormElement
  titleInputElement: HTMLInputElement
  descriptionInputElement: HTMLInputElement
  peopleInputElement: HTMLInputElement

  constructor() {
    this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement
    this.hostElement = document.getElementById('app')! as HTMLDivElement

    const importedNode = document.importNode(this.templateElement.content, true)
    this.element = importedNode.firstElementChild as HTMLFormElement
    this.element.id = 'user-input'

    this.titleInputElement = this.element.querySelector('#title') as HTMLInputElement
    this.descriptionInputElement = this.element.querySelector('#description') as HTMLInputElement
    this.peopleInputElement = this.element.querySelector('#people') as HTMLInputElement

    this.configure()
    this.attach()
  }

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

  private configure() {
    this.element.addEventListener('submit', this.submitHandler)
  }

  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.element)
  }
}

const projInput = new ProjectInput()
const activeProjects = new ProjectList('active')
const finishedProjects = new ProjectList('finished')
