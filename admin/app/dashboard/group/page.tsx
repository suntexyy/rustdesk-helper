import GroupCreate from "@/features/group/components/GroupCreate";
import GroupList from "@/features/group/components/GroupList";

const Group = () => {
  return (
    <div className="flex gap-10 justify-center items-center my-auto">
      <GroupCreate />
      <GroupList />
    </div>
  );
};

export default Group;
