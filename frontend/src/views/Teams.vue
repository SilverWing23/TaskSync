<template>
  <div class="teams-page">
    <div class="page-header">
      <div class="header-left">
        <h1>团队管理</h1>
        <p>管理您的团队和成员</p>
      </div>
      <el-button type="primary" @click="showCreateModal = true">
        <component :is="icons.Plus" />
        <span>创建团队</span>
      </el-button>
    </div>
    
    <div class="team-list">
      <div v-for="team in teams" :key="team.id" class="team-card">
        <div class="team-header">
          <div class="team-info">
            <h3>{{ team.name }}</h3>
            <p>{{ team.description }}</p>
          </div>
          <div class="team-actions">
            <el-button type="text" @click="editTeam(team)">编辑</el-button>
            <el-button type="text" @click="deleteTeam(team)" class="delete-btn">删除</el-button>
          </div>
        </div>
        
        <div class="team-members">
          <div class="members-header">
            <span>成员 ({{ getMembers(team.id).length }})</span>
            <el-button type="text" @click="showAddMemberModal(team)">
              <component :is="icons.UserPlus" />
              <span>邀请成员</span>
            </el-button>
          </div>
          
          <div class="members-list">
            <div v-for="member in getMembers(team.id)" :key="member.id" class="member-item">
              <div class="member-avatar">
                <component :is="icons.User" />
              </div>
              <div class="member-info">
                <span class="member-name">{{ member.nickname }}</span>
                <span :class="['member-role', member.role]">{{ getRoleText(member.role) }}</span>
              </div>
              <el-button 
                v-if="canRemoveMember(team.id, member.id)" 
                type="text" 
                @click="removeMember(team.id, member.id)" 
                class="remove-btn"
              >
                <component :is="icons.X" />
              </el-button>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="teams.length === 0" class="empty-state">
        <component :is="icons.Users" class="empty-icon" />
        <p>暂无团队</p>
        <el-button type="primary" @click="showCreateModal = true">创建第一个团队</el-button>
      </div>
    </div>
    
    <el-dialog title="创建团队" v-model="showCreateModal" width="450px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="团队名称" :rules="[{ required: true, message: '请输入团队名称' }]">
          <el-input v-model="form.name" placeholder="请输入团队名称" />
        </el-form-item>
        <el-form-item label="团队描述">
          <el-input v-model="form.description" type="textarea" placeholder="请输入团队描述" :rows="3" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showCreateModal = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">创建</el-button>
      </template>
    </el-dialog>
    
    <el-dialog title="编辑团队" v-model="showEditModal" width="450px">
      <el-form :model="editForm" label-width="80px">
        <el-form-item label="团队名称" :rules="[{ required: true, message: '请输入团队名称' }]">
          <el-input v-model="editForm.name" placeholder="请输入团队名称" />
        </el-form-item>
        <el-form-item label="团队描述">
          <el-input v-model="editForm.description" type="textarea" placeholder="请输入团队描述" :rows="3" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showEditModal = false">取消</el-button>
        <el-button type="primary" @click="handleEdit">保存</el-button>
      </template>
    </el-dialog>
    
    <el-dialog title="邀请成员" v-model="showAddMemberModalVisible" width="450px">
      <el-form :model="memberForm" label-width="80px">
        <el-form-item label="选择成员" :rules="[{ required: true, message: '请选择成员' }]">
          <el-select v-model="memberForm.user_id" placeholder="选择成员">
            <el-option 
              v-for="user in availableUsers" 
              :key="user.id" 
              :label="user.nickname" 
              :value="user.id" 
            />
          </el-select>
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="memberForm.role" placeholder="选择角色">
            <el-option label="管理员" value="admin" />
            <el-option label="成员" value="member" />
            <el-option label="只读" value="readonly" />
          </el-select>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showAddMemberModalVisible = false">取消</el-button>
        <el-button type="primary" @click="handleAddMember">邀请</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>import { ref, reactive, computed, onMounted } from 'vue';
import { useTeamStore } from '../stores/team';
import { useUserStore } from '../stores/user';
import { ElMessage, ElMessageBox } from 'element-plus';
import axios from '../utils/axios';
import * as icons from 'lucide-vue-next';
const teamStore = useTeamStore();
const userStore = useUserStore();
const teams = computed(() => teamStore.teams);
const allUsers = ref([]);
const currentTeam = ref(null);
const showCreateModal = ref(false);
const showEditModal = ref(false);
const showAddMemberModalVisible = ref(false);
const editingTeam = ref(null);
const form = reactive({
 name: '',
 description: ''
});
const editForm = reactive({
 name: '',
 description: ''
});
const memberForm = reactive({
 user_id: '',
 role: 'member'
});
const availableUsers = computed(() => {
 if (!currentTeam.value)
 return allUsers.value;
 const teamMemberIds = currentTeam.value.members?.map(m => m.id) || [];
 return allUsers.value.filter(u => !teamMemberIds.includes(u.id));
});
function getMembers(teamId) {
 const team = teams.value.find(t => t.id === teamId);
 return team?.members || [];
}
function getRoleText(role) {
 const map = { admin: '管理员', member: '成员', readonly: '只读' };
 return map[role] || role;
}
function canRemoveMember(teamId, memberId) {
 return userStore.user.id !== memberId;
}
function editTeam(team) {
 editingTeam.value = team;
 editForm.name = team.name;
 editForm.description = team.description || '';
 showEditModal.value = true;
}
async function deleteTeam(team) {
 ElMessageBox.confirm('确定要删除这个团队吗？', '确认删除', {
 confirmButtonText: '确定',
 cancelButtonText: '取消',
 type: 'warning'
 }).then(async () => {
 await teamStore.deleteTeam(team.id);
 });
}
function showAddMemberModal(team) {
 currentTeam.value = team;
 showAddMemberModalVisible.value = true;
}
async function removeMember(teamId, memberId) {
 ElMessageBox.confirm('确定要移除该成员吗？', '确认移除', {
 confirmButtonText: '确定',
 cancelButtonText: '取消'
 }).then(async () => {
 await teamStore.removeMember(teamId, memberId);
 await teamStore.fetchTeams();
 });
}
async function handleCreate() {
 if (!form.name) {
 ElMessage.error('请输入团队名称');
 return;
 }
 await teamStore.createTeam(form);
 showCreateModal.value = false;
 form.name = '';
 form.description = '';
}
async function handleEdit() {
 if (!editForm.name) {
 ElMessage.error('请输入团队名称');
 return;
 }
 await teamStore.updateTeam(editingTeam.value.id, editForm);
 showEditModal.value = false;
}
async function handleAddMember() {
 if (!memberForm.user_id) {
 ElMessage.error('请选择成员');
 return;
 }
 await teamStore.addMember(currentTeam.value.id, memberForm.user_id, memberForm.role);
 await teamStore.fetchTeams();
 showAddMemberModalVisible.value = false;
 memberForm.user_id = '';
 memberForm.role = 'member';
}
onMounted(async () => {
 await teamStore.fetchTeams();
 const usersResult = await axios.get('/users');
 if (usersResult.data.success) {
 allUsers.value = usersResult.data.data;
 }
});
</script>

<style scoped>
.teams-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left h1 {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px;
}

.header-left p {
  color: #6b7280;
  margin: 0;
}

.team-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.team-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.team-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.team-info h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 8px;
}

.team-info p {
  color: #6b7280;
  margin: 0;
}

.team-actions {
  display: flex;
  gap: 16px;
}

.team-actions .el-button {
  padding: 0;
  font-size: 13px;
  color: #667eea;
}

.delete-btn {
  color: #ef4444 !important;
}

.team-members {
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.members-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  color: #6b7280;
}

.members-header .el-button {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  color: #667eea;
}

.members-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  background: #f9fafb;
  border-radius: 8px;
}

.member-avatar {
  width: 36px;
  height: 36px;
  background: #e5e7eb;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.member-avatar svg {
  width: 18px;
  height: 18px;
  color: #6b7280;
}

.member-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.member-name {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
}

.member-role {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
}

.member-role.admin {
  background: #fee2e2;
  color: #dc2626;
}

.member-role.member {
  background: #dbeafe;
  color: #2563eb;
}

.member-role.readonly {
  background: #f3f4f6;
  color: #6b7280;
}

.remove-btn {
  color: #9ca3af;
  padding: 4px;
}

.remove-btn:hover {
  color: #ef4444;
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px;
  color: #9ca3af;
}

.empty-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
}

.empty-state p {
  margin: 0 0 20px;
}
</style>