import { apiFetch } from "@/lib/api";
import Swal from "sweetalert2";

export const getUsers = async (setUsers, setIsLoading) => {
  setIsLoading(true);

  try {
    const res = await apiFetch("/api/admin/user", {
      method: "GET",
    });

    if (!res || res.length === 0) {
      setUsers([]);
      Swal.fire({
        icon: "info",
        title: "ไม่พบข้อมูลผู้ใช้",
        text: "ยังไม่มีผู้ใช้ในระบบ",
      });
      return;
    }
    setUsers(res.data);

  } catch (err) {
    console.error("FETCH USER ERROR:", err);
    Swal.fire({
      icon: "error",
      title: "ข้อผิดพลาด",
      text: err.message || "ไม่สามารถโหลดข้อมูลผู้ใช้ได้",
    });
  } finally {
    setIsLoading(false);
  }
};



export const deleteUser = async (userId, setUsers,users ) => {
  try {

    Swal.fire({
      title: "ยืนยันการลบผู้ใช้?",
      text: "การลบผู้ใช้จะไม่สามารถกู้คืนได้",  
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const res = await apiFetch('/api/admin/delete_user', {
          method: "POST",
          body: { user_id: userId },
        });
        if (!res || res.error || res.status >= 400) {
          Swal.fire({
            icon: "error",
            title: "ไม่สามารถลบผู้ใช้ได้",
            text: res?.message || "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์",
          });
          return;
        }

        Swal.fire({
          icon: "success",
          title: "ลบผู้ใช้สำเร็จ",
          text: "ผู้ใช้ถูกลบออกจากระบบแล้ว",
        });
      
        setUsers(users.filter(u => u.user_ID !== userId));

      }
    });

 
    
  } catch (err) {
    console.error("DELETE USER ERROR:", err);
    Swal.fire({
      icon: "error",
      title: "ข้อผิดพลาด",
      text: err.message || "ไม่สามารถลบผู้ใช้ได้",
    });
    throw err;
  } finally {
     
  }
};





export const createUser = async (userData, setLoading, setUsers) => {
  try {
    setLoading(true);
    if (
      !userData.first_name ||
      !userData.last_name ||
      !userData.birth_date ||
      !userData.phone_number ||
      !userData.email ||
      !userData.position ||
      !userData.gender ||
      !userData.password
    ) {
      Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบถ้วน",
        text: "กรุณากรอกข้อมูลผู้ใช้งานให้ครบถ้วน",
      });
      return;
    }

    const res = await apiFetch("/api/admin/create_user", {
      method: "POST",
      body: {
        ...userData,
      },
    });

    if (!res || res.error || res.status >= 400) {
      Swal.fire({
        icon: "error",
        title: "ไม่สามารถสร้างผู้ใช้ได้",
        text: res?.message || "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์",
      });
      return;
    }

    Swal.fire({
      icon: "success",
      title: "สร้างผู้ใช้สำเร็จ",
      text: "ผู้ใช้ใหม่ถูกสร้างเรียบร้อยแล้ว",
    });

    setUsers((prevUsers) => [...prevUsers, res.data]);

  } catch (err) {
    console.error("CREATE USER ERROR:", err);

    Swal.fire({
      icon: "error",
      title: "ข้อผิดพลาด",
      text: err.message || "ไม่สามารถสร้างผู้ใช้ได้",
    });

    throw err;

  } finally {
    setLoading(false);
  }
};



export const  updateUserList = async (userData, setUsers) => {
  try {

    if (
      !userData.first_name ||
      !userData.last_name ||
      !userData.phone_number ||
      !userData.email ||
      !userData.position ||
      !userData.gender
    ) {
      Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบถ้วน",
        text: "กรุณากรอกข้อมูลผู้ใช้งานให้ครบถ้วน",
      });
      return;
    }

      const result = await apiFetch("/api/admin/update_profile", {
        method: "POST",
        body: {
            first_name: userData.first_name,
            user_id : userData.user_ID,
            last_name: userData.last_name,
            phone_number: userData.phone_number,
            address: userData.address,
            email: userData.email,
            gender : userData.gender,

        }
      });

      if (!result.ok) {
        Swal.fire({
          icon: "error",
          title: "อัปเดตข้อมูลล้มเหลว",
          text: result.message || "เกิดข้อผิดพลาดในการอัปเดตข้อมูล",
        });
        return;
      } 

      Swal.fire({
          icon: "success",
          title: "อัปเดตข้อมูลสำเร็จ",
          text: "บันทึกข้อมูลแล้ว",
        });
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.user_ID === userData.user_ID ? { ...u, ...userData } : u
        )
      );
  } catch (err) {
    console.error("UPDATE USER ERROR:", err);

      Swal.fire({
         icon: "error",
         title: "เกิดข้อผิดพลาด",
         text: err.message || "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
         });
    throw err;
  } finally {

  }
};

  

export const createFarm = async (user_ID, farmFormData) => {
  try {
    console.log("Creating farm for user ID:", user_ID);
    console.log("Farm data:", farmFormData);

    if (
      !farmFormData.farm_name ||
      !farmFormData.area ||
      !farmFormData.rice_variety ||
      !farmFormData.planting_method ||
      !farmFormData.soil_type ||
      !farmFormData.water_management ||
      !farmFormData.address
    ) {
      Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบถ้วน",
        text: "กรุณากรอกข้อมูลฟาร์มให้ครบถ้วน",
      });
      return null;
    }

    if (!user_ID) {
      Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบถ้วน",
        text: "ไม่พบรหัสผู้ใช้สำหรับสร้างฟาร์ม",
      });
      return null;
    }


    // ยิง API จริง
    const res = await apiFetch("/api/admin/farm/create", {
      method: "POST",
      body: {
         user_id: user_ID,
        ...farmFormData,
      },
    });
         if (!res.ok) {
        Swal.fire({
          icon: "error",
          title: "สร้างฟาร์มล้มเหลว",
          text: result.message || "เกิดข้อผิดพลาดในการสร้างข้อมูล",
        });
        return;
      } 

      if(!res || res.error || res.status >= 400){
        Swal.fire({
          icon: "error",
          title: "ไม่สามารถสร้างฟาร์มได้",
          text: res?.message || "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์",
        });
        return null;
      }

    Swal.fire({
      icon: "success",
      title: "สร้างฟาร์มสำเร็จ",
      text: "บันทึกข้อมูลแล้ว",
    });


      
    
    return {
      ...res.data.farmArea,
      areas: res.data.farmArea?.areas || [],
    };

  } catch (err) {
    console.error("CREATE FARM ERROR:", err);
    Swal.fire({
      icon: "error",
      title: "ข้อผิดพลาด",
      text: err.message || "ไม่สามารถสร้างฟาร์มได้",
    });
    return null;
  }
};


export const deleteFarm = async (farm_id) => {
  try {
    if (!farm_id) {
      Swal.fire({
        icon: "warning",
        title: "ไม่พบรหัสฟาร์ม",
        text: "กรุณาระบุรหัสฟาร์มที่ต้องการลบ",
      });
      return false;
    }

    const res = await apiFetch("/api/farm-area/delete", {
      method: "POST",
      body: { farm_id },
    });

    if (!res.ok) {
      Swal.fire({
        icon: "error",
        title: "ไม่สามารถลบฟาร์มได้",
        text: res?.message || "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์",
      });
      return false;
    }

    Swal.fire({
      icon: "success",
      title: "ลบฟาร์มสำเร็จ",
      text: "ข้อมูลฟาร์มถูกลบแล้ว",
    });

    return true;

  } catch (err) {
    console.error("DELETE FARM ERROR:", err);
    Swal.fire({
      icon: "error",
      title: "ข้อผิดพลาด",
      text: err.message || "ไม่สามารถลบฟาร์มได้",
    });
    return false;
  }
};


export const updateFarm = async (farm_id, farmFormData) => {
  try {
    if (
      !farm_id ||
      !farmFormData?.farm_name ||
      !farmFormData?.area ||
      !farmFormData?.rice_variety ||
      !farmFormData?.planting_method ||
      !farmFormData?.soil_type ||
      !farmFormData?.water_management ||
      !farmFormData?.address
    ) {
      Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบถ้วน",
        text: "กรุณากรอกข้อมูลฟาร์มให้ครบถ้วน",
      });
      return null;
    }

    const res = await apiFetch("/api/admin/farm/update", {
      method: "POST",
      body: {
        farm_id,
        ...farmFormData,
      },
    });

    if (!res.ok) {
      Swal.fire({
        icon: "error",
        title: "แก้ไขฟาร์มไม่สำเร็จ",
        text: res?.message || "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์",
      });
      return null;
    }

    Swal.fire({
      icon: "success",
      title: "แก้ไขฟาร์มสำเร็จ",
      text: "ข้อมูลฟาร์มถูกอัปเดตแล้ว",
    });

    return res.data.farmArea;

  } catch (err) {
    console.error("UPDATE FARM ERROR:", err);
    Swal.fire({
      icon: "error",
      title: "ข้อผิดพลาด",
      text: err.message || "ไม่สามารถแก้ไขฟาร์มได้",
    });
    return null;
  }
};



export const createSubArea = async (farm_id, area_name) => {
  try {
    if (!farm_id || !area_name?.trim()) {
      Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบถ้วน",
        text: "กรุณาระบุชื่อพื้นที่ย่อย",
      });
      return null;
    }

    const res = await apiFetch("/api/admin/area/create", {
      method: "POST",
      body: {
        farm_id,
        area_name,
      },
    });

    if (!res.ok || res.error) {
      Swal.fire({
        icon: "error",
        title: "เพิ่มพื้นที่ย่อยไม่สำเร็จ",
        text: res?.message || "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์",
      });
      return null;
    }

    Swal.fire({
      icon: "success",
      title: "เพิ่มพื้นที่ย่อยสำเร็จ",
      text: "พื้นที่ย่อยถูกเพิ่มเรียบร้อยแล้ว",
    });

    return res.data.sub_area;

  } catch (err) {
    console.error("CREATE SUB AREA ERROR:", err);
    Swal.fire({
      icon: "error",
      title: "ข้อผิดพลาด",
      text: err.message || "ไม่สามารถเพิ่มพื้นที่ย่อยได้",
    });
    return null;
  }
};


export const updateSubArea = async (area_id, area_name) => {
  try {
    if (!area_id || !area_name?.trim()) {
      Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบถ้วน",
        text: "กรุณาระบุชื่อพื้นที่ย่อย",
      });
      return null;
    }

    const res = await apiFetch("/api/admin/area/update", {
      method: "POST",
      body: {
        area_id,
        area_name,
      },
    });

    if (!res.ok || res.error) {
      Swal.fire({
        icon: "error",
        title: "แก้ไขพื้นที่ย่อยไม่สำเร็จ",
        text: res?.message || "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์",
      });
      return null;
    }

    Swal.fire({
      icon: "success",
      title: "แก้ไขพื้นที่ย่อยสำเร็จ",
      text: "ชื่อพื้นที่ย่อยถูกอัปเดตแล้ว",
    });

    return res.data.subArea;

  } catch (err) {
    console.error("UPDATE SUB AREA ERROR:", err);
    Swal.fire({
      icon: "error",
      title: "ข้อผิดพลาด",
      text: err.message || "ไม่สามารถแก้ไขพื้นที่ย่อยได้",
    });
    return null;
  }
};

export const deleteSubAreaAPI = async (area_id) => {
  try {
    if (!area_id) {
      Swal.fire({
        icon: "warning",
        title: "ไม่พบรหัสพื้นที่ย่อย",
        text: "กรุณาระบุพื้นที่ย่อยที่ต้องการลบ",
      });
      return false;
    }

    const res = await apiFetch("/api/admin/area/delete", {
      method: "POST",
      body: { area_id },
    });

    if (!res.ok || res.error) {
      Swal.fire({
        icon: "error",
        title: "ลบพื้นที่ย่อยไม่สำเร็จ",
        text: res?.message || "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์",
      });
      return false;
    }

    Swal.fire({
      icon: "success",
      title: "ลบพื้นที่ย่อยสำเร็จ",
      text: "พื้นที่ย่อยถูกลบเรียบร้อยแล้ว",
    });

    return true;
  } catch (err) {
    console.error("DELETE SUB AREA ERROR:", err);
    Swal.fire({
      icon: "error",
      title: "ข้อผิดพลาด",
      text: err.message || "ไม่สามารถลบพื้นที่ย่อยได้",
    });
    return false;
  }
};