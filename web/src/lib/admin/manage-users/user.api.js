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

  


export const createFarm = async ({
      user_ID, farmFormData
}) => {
  try {

   console.log("Creating farm for user ID:", user_ID, "with data:", farmFormData);
    if (
      !user_ID ||
      !farmData.farm_name ||
      !farmData.area ||
      !farmData.rice_variety ||
      !farmData.planting_method ||
      !farmData.soil_type ||
      !farmData.water_management ||
      !farmData.address
    ) {
      Swal.fire({
        icon: "warning",
        title: "ข้อมูลไม่ครบถ้วน",
        text: "กรุณากรอกข้อมูลฟาร์มให้ครบถ้วน",
      });
      return;
    }

    // =============================
    // 2) ยิง API จริง
    // =============================
    const res = await apiFetch("/api/admin/farm/create", {
      method: "POST",
      body: {
        user_ID: user_ID,
        ...farmFormData,
      },
    });

    if (!res || res.status >= 400 || res.error) {
      Swal.fire({
        icon: "error",
        title: "สร้างฟาร์มไม่สำเร็จ",
        text: res?.message || "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์",
      });
      return;
    }

    // backend ส่ง farm กลับมา
    const createdFarm = {
      ...res.farm,
      areas: res.farm?.areas || [],
    };

    // =============================
    // 3) Update state (UI)
    // =============================
    const newFarms = [...(userFormData.Farm || []), createdFarm];

    setUserFormData({
      ...userFormData,
      Farm: newFarms,
    });

    setUsers(
      users.map((u) =>
        u.user_ID === userId
          ? { ...u, Farm: newFarms }
          : u
      )
    );

    Swal.fire({
      icon: "success",
      title: "สร้างฟาร์มสำเร็จ",
      text: "เพิ่มแปลงเกษตรเรียบร้อยแล้ว",
    });


    return createdFarm;

  } catch (err) {
    console.error("CREATE FARM ERROR:", err);
    Swal.fire({
      icon: "error",
      title: "ข้อผิดพลาด",
      text: err.message || "ไม่สามารถสร้างฟาร์มได้",
    });
  } finally {
  }
};