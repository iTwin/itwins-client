/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as chai from "chai";
import type { AccessToken } from "@itwin/core-bentley";
import { ProjectsAccessClient } from "../../ProjectsClient";
import type { Project} from "../../ProjectsAccessProps";
import { ProjectsSearchableProperty, ProjectsSource } from "../../ProjectsAccessProps";
import { TestConfig } from "../TestConfig";

chai.should();
describe("ProjectsClient", () => {
  const projectsAccessClient: ProjectsAccessClient = new ProjectsAccessClient();
  let accessToken: AccessToken;

  before(async function () {
    this.timeout(0);
    accessToken = await TestConfig.getAccessToken();
  });

  it("should get a list of projects", async () => {
    const projectList: Project[] = await projectsAccessClient.getAll(accessToken);

    // At least one project
    chai.expect(projectList).to.not.be.empty;
  });

  it("should get a paged list of projects using top", async () => {
    const numberOfProjects = 3;

    // Verify there are enough projects to test the paging
    const fullProjectList: Project[] = await projectsAccessClient.getAll(accessToken);
    chai.assert(fullProjectList.length >= numberOfProjects, "Unable to meaningfully run test since there are too few projects.");

    const partialProjectList: Project[] = await projectsAccessClient.getAll(accessToken,
      {
        pagination: {
          top: numberOfProjects,
        },
      });

    // Get the same number of projects as the top param
    chai.expect(partialProjectList).length(numberOfProjects, "Paged list length does not match top value.");
  });

  it("should get a paged list of projects using skip", async () => {
    const numberSkipped = 4;

    // Verify there are enough projects to test the paging
    const fullProjectList: Project[] = await projectsAccessClient.getAll(accessToken);
    chai.assert(fullProjectList.length >= numberSkipped, "Unable to meaningfully run test since there are too few projects.");

    const partialProjectList: Project[] = await projectsAccessClient.getAll(accessToken,
      {
        pagination: {
          skip: numberSkipped,
        },
      });

    // Get all but the skipped ones
    chai.expect(partialProjectList).length(fullProjectList.length - numberSkipped, "Paged list length does not match the expected number skipped.");
  });

  it("should get a continuous paged list of projects", async () => {
    const numberOfProjects = 3;
    const numberSkipped = 2;

    // Verify the paging properties can be tested
    chai.assert(numberSkipped < numberOfProjects, "There must be overlap between the two pages to run test.");

    // Verify there are enough projects to test the paging
    const fullProjectList: Project[] = await projectsAccessClient.getAll(accessToken,
      {
        pagination: {
          top: numberOfProjects + numberSkipped,
        },
      });
    chai.assert(fullProjectList.length === numberOfProjects + numberSkipped, "Unable to meaningfully run test since there are too few projects.");

    const firstPageList: Project[] = await projectsAccessClient.getAll(accessToken,
      {
        pagination: {
          top: numberOfProjects,
        },
      });

    const secondPageList: Project[] = await projectsAccessClient.getAll(accessToken,
      {
        pagination: {
          top: numberOfProjects,
          skip: numberSkipped,
        },
      });

    // Find all projects from the first page that are not in the second
    const uniqueFirstPageProjects: Project[] = firstPageList.filter((firstProject) => {
      return !secondPageList.some((secondProject) => secondProject.id === firstProject.id);
    });

    // Find all projects from the second page that are not in the first
    const uniqueSecondPageProjects: Project[] = secondPageList.filter((secondProject) => {
      return !firstPageList.some((firstProject) => secondProject.id === firstProject.id);
    });

    // Both pages should have a full page's worth of projects
    chai.expect(firstPageList).length(numberOfProjects, "First page length does not match top value.");
    chai.expect(secondPageList).length(numberOfProjects, "Second page length does not match top value.");

    // The number of unique projects must match the number skipped
    chai.expect(uniqueFirstPageProjects).length(numberSkipped, "The number of first page specific items does not match the skip value.");
    chai.expect(uniqueSecondPageProjects).length(numberSkipped, "The number of second page specific items does not match the skip value.");

    // Both pages are contained within the larger full page
    // Reduce objects down to project properties
    const mappedFullProjectList: Project[] = fullProjectList.map((project) => {
      return {
        id: project.id,
        name: project.name,
        code: project.code,
      };
    });

    chai.expect(mappedFullProjectList).to.deep.include.members(firstPageList.map((project) => {
      return {
        id: project.id,
        name: project.name,
        code: project.code,
      };
    }), "The first page contains items not present in the full page.");

    chai.expect(mappedFullProjectList).to.deep.include.members(secondPageList.map((project) => {
      return {
        id: project.id,
        name: project.name,
        code: project.code,
      };
    }), "The second page contains items not present in the full page.");
  });

  it("should get a list of projects by name", async () => {
    const projectList: Project[] = await projectsAccessClient.getAll(accessToken, {
      search: {
        searchString: TestConfig.projectName,
        propertyName: ProjectsSearchableProperty.Name,
        exactMatch: true,
      },
    });

    // At least one project
    chai.expect(projectList).to.not.be.empty;
    // All items match the name
    projectList.forEach((project) => {
      chai.expect(project).property("name").equal(TestConfig.projectName);
    });
  });

  it("should get a list of recent projects", async () => {
    const projectList: Project[] = await projectsAccessClient.getAll(accessToken, {
      source: ProjectsSource.Recents,
    });

    // At least one project
    // TODO: is there a way to verify the recency of the projects?
    chai.expect(projectList).to.not.be.empty;
  });

  it("should get a list of favorite projects", async () => {
    const projectList: Project[] = await projectsAccessClient.getAll(accessToken, {
      source: ProjectsSource.Favorites,
    });

    // At least one project
    // TODO: is there a way to verify if these projects are all the favorites?
    chai.expect(projectList).to.not.be.empty;
  });
});
