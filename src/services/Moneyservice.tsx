import BookeeEntry from "../types/BookeeEntry";
import BookeeMod from "../types/BookeeMod";

export const calc = (entry: BookeeEntry) => {
  let pOneSum = entry.pOne;
  let pTwoSum = entry.pTwo;
  entry.mods.forEach((mod: BookeeMod) => {
    if (mod.pOneMod !== undefined) pOneSum += mod.pOneMod;
    if (mod.pTwoMod !== undefined) pTwoSum += mod.pTwoMod;
  });
  return {
    one: pOneSum,
    two: pTwoSum,
  };
};
