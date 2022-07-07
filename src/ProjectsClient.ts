/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module ProjectsClient
 */
import type { AccessToken } from "@itwin/core-bentley";
import type { AxiosRequestConfig } from "axios";
import axios from "axios";
import type { Project, ProjectsAccess, ProjectsLinks, ProjectsQueryArg, ProjectsQueryResult } from "./ProjectsAccessProps";

/** Client API to access the project services.
 * @beta
 */
export class ProjectsAccessClient implements ProjectsAccess {
  private _baseUrl: string = "https://api.bentley.com/projects/";

  public constructor() {
    const urlPrefix = process.env.IMJS_URL_PREFIX;
    if (urlPrefix) {
      const baseUrl = new URL(this._baseUrl);
      baseUrl.hostname = urlPrefix + baseUrl.hostname;
      this._baseUrl = baseUrl.href;
    }
  }

  /** Get projects accessible to the user
   * @param accessToken The client access token string
   * @param arg Options for paging and/or searching
   * @returns Array of projects, may be empty
   */
  public async getAll(accessToken: AccessToken, arg?: ProjectsQueryArg): Promise<Project[]> {
    return (await this.getByQuery(accessToken, arg)).projects;
  }

  /** Gets projects using the given query options
   * @param accessToken The client access token string
   * @param arg Optional object containing queryable properties
   * @returns Projects and links meeting the query's requirements
   */
  public async getByQuery(accessToken: AccessToken, arg?: ProjectsQueryArg): Promise<ProjectsQueryResult> {
    let url = this._baseUrl;
    if (arg)
      url = url + this.getQueryString(arg);
    return this.getByUrl(accessToken, url);
  }

  private async getByUrl(accessToken: AccessToken, url: string): Promise<ProjectsQueryResult> {
    const requestOptions = this.getRequestOptions(accessToken);
    const projects: Project[] = [];
    const links: ProjectsLinks = {};

    try {
      const response = await axios.get(url, requestOptions);

      if (!response.data.projects) {
        new Error("Expected array of projects not found in API response.");
      }

      response.data.projects.forEach((project: any) => {
        projects.push({
          id: project.id,
          name: project.displayName,
          code: project.projectNumber,
        });
      });

      const linkData = response.data._links;
      if (linkData) {
        if (linkData.self && linkData.self.href)
          links.self = async (token: AccessToken) => this.getByUrl(token, linkData.self.href);
        if (linkData.next && linkData.next.href)
          links.next = async (token: AccessToken) => this.getByUrl(token, linkData.next.href);
        if (linkData.prev && linkData.prev.href)
          links.previous = async (token: AccessToken) => this.getByUrl(token, linkData.prev.href);
      }
    } catch (errorResponse: any) {
      throw Error(`API request error: ${JSON.stringify(errorResponse)}`);
    }

    return { projects, links };
  }

  /**
   * Build the request methods, headers, and other options
   * @param accessTokenString The client access token string
   */
  private getRequestOptions(accessTokenString: string): AxiosRequestConfig {
    return {
      method: "GET",
      headers: {
        "authorization": accessTokenString,
        "content-type": "application/json",
      },
    };
  }

  /**
   * Build a query to be appended to a URL
   * @param queryArg Object container queryable properties
   * @returns String beginning with '?' to be appended to a URL, or it may be empty
   */
  private getQueryString(queryArg: ProjectsQueryArg): string {
    let queryBuilder = "";

    // Handle searches
    if (queryArg.search) {
      if (queryArg.search.exactMatch)
        queryBuilder = `${queryBuilder}${queryArg.search.propertyName}=${queryArg.search.searchString}&`;

      // Currently the API only allows substring searching across both name and code at the same time
      else
        queryBuilder = `${queryBuilder}$search=${queryArg.search.searchString}&`;
    }

    // Handle pagination
    if (queryArg.pagination) {
      if (queryArg.pagination.skip)
        queryBuilder = `${queryBuilder}$skip=${queryArg.pagination.skip}&`;
      if (queryArg.pagination.top)
        queryBuilder = `${queryBuilder}$top=${queryArg.pagination.top}&`;
    }

    // slice off last '&'
    if (queryBuilder.length > 0 && queryBuilder[queryBuilder.length - 1] === "&")
      queryBuilder = queryBuilder.slice(0, -1);

    // Handle source
    let sourcePath = "";
    if (queryArg.source !== undefined && queryArg.source.length > 0) {
      sourcePath = `${queryArg.source}/`;
    }

    // No query
    if (queryBuilder.length === 0)
      return sourcePath;

    return `${sourcePath}?${queryBuilder}`;
  }
}
