export interface Directory {
  directory: string
}

/***
 * Requests
 */

export interface XmlReadFilesRequest {
  startDate: Date
  endDate: Date
}

export interface XmlGetRequest {
  id: string
}

/**
 * Responses
 */
