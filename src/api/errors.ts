export class MyTokriError extends Error {
  status: number
  errorCode: number

  constructor(status: number, errorCode: number, message: string) {
    super(message)
    this.name = 'MyTokriError'
    this.status = status
    this.errorCode = errorCode
  }
}

export class UnauthorisedError extends Error {
  constructor() {
    super('Unauthorised')
    this.name = 'UnauthorisedError'
  }
}
