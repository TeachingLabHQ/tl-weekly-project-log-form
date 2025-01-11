import type { ActionFunctionArgs } from "@vercel/remix";

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const skillId = formData.get("skillId") as string;
  const materialContent = formData.get("aiContent") as string;
  const gradeLevel = formData.get("gradeLevel") as string;
  const classTopic = formData.get("classTopic") as string;
  const writingSkill = formData.get("writingSkill") as string;
  const translation = formData.get("translation") as string;
  const lessonPlan = formData.get("lessonPlan") as File;

  //submit the log
  // const { data, error } = await newMaterialService.insertNewMaterial(
  //   Number.parseInt(skillId),
  //   materialContent,
  //   userId,
  //   JSON.stringify(materialInputMetaData),
  // );
  // if (error) {
  //   console.error("Failed to insert the new worksheet", error);
  //   new Response(null, { status: 500, statusText: error.message });
  // }
  // return new Response(JSON.stringify({ data }), { status: 201 });
};
