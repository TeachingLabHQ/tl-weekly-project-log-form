import { LoaderFunctionArgs } from "@remix-run/node";
import React from "react";
import { projectRepository } from "~/domains/project/repository";
import { projectService } from "~/domains/project/service";

export const loader = async (args: LoaderFunctionArgs) => {
  return null;
};
