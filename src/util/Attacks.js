import React, { useState, useEffect,useRef } from "react";
import { useQueue } from "./useQueue";
import { damage } from "./damage";
import skillEffect from "../component/SkilleEffect";

export const Attacks = (bt, attack, skillNumber, enqueue) => {
    const ppKey = `pp${skillNumber}`;
    const skKey = `sk${skillNumber}`;

    const atk = attack.atks;
    const def = attack.defs;
    const text1 = bt[atk].origin.name+"의 "+bt[atk].origin[skKey].name;
    enqueue({battle:bt, text:text1});
  
    let skillDamage = damage(bt, skillNumber, atk);
    
    bt[def].hp -= skillDamage; // 받은 데미지를 반영한 후의 HP
    if (bt[def].hp < 0) {
      bt[def].hp = 0;
    }
  
    bt[atk][ppKey] -= 1;

    enqueue({battle:bt, text:text1});

    const skillFunction = skillEffect(bt[atk].origin[skKey].skillEffect);
    if (typeof skillFunction === "function") {
      skillFunction("kk");
    } 
  };
