#ifndef __STUDENT_H__
#define __STUDENT_H__

template <typename KeyT,
          typename MappedT,
          typename CompareT>
size_t CP::map_bst<KeyT,MappedT,CompareT>::process(node* ptr) const {
  //std::cout<<(ptr->data)<<"\n";
  if(ptr->left == NULL && ptr->right != NULL) return 1+process(ptr->right);
  else if(ptr->left != NULL && ptr->right == NULL) return 1+process(ptr->left);
  else if(ptr->left == NULL && ptr->right == NULL) return 0;
  else return process(ptr->left)+process(ptr->right);
  //return 0;
}


template <typename KeyT,
          typename MappedT,
          typename CompareT>
size_t CP::map_bst<KeyT,MappedT,CompareT>::count_unary() const {
  return process(mRoot);
}

#endif
