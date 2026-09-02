using System;
using System.Collections.Generic;
using UnityEngine;

namespace ZonaTRunner.Utils
{
    public class ObjectPool<T> where T : Component
    {
        private readonly T prefab;
        private readonly Transform parent;
        private readonly Queue<T> pool = new Queue<T>();
        private readonly Action<T> onSpawn;
        private readonly Action<T> onDespawn;

        public int CountInactive => pool.Count;

        public ObjectPool(T prefab, int initialSize, Transform parent = null, Action<T> onSpawn = null, Action<T> onDespawn = null)
        {
            this.prefab = prefab;
            this.parent = parent;
            this.onSpawn = onSpawn;
            this.onDespawn = onDespawn;

            for (int i = 0; i < initialSize; i++)
            {
                T obj = GameObject.Instantiate(prefab, parent);
                obj.gameObject.SetActive(false);
                pool.Enqueue(obj);
            }
        }

        public T Get()
        {
            T item;
            if (pool.Count > 0)
            {
                item = pool.Dequeue();
            }
            else
            {
                item = GameObject.Instantiate(prefab, parent);
            }

            item.gameObject.SetActive(true);
            onSpawn?.Invoke(item);
            return item;
        }

        public void Return(T item)
        {
            if (item == null) return;

            onDespawn?.Invoke(item);
            item.gameObject.SetActive(false);
            pool.Enqueue(item);
        }
    }
}
